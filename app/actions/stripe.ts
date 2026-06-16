'use server'

import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { guides, purchases, user } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}

// --- Stripe Connect Onboarding ---

export async function createConnectAccount() {
  const currentUser = await getUser()
  
  // Check if user already has a Stripe account
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1)
  
  if (dbUser?.stripeAccountId) {
    // Return existing account
    return { accountId: dbUser.stripeAccountId }
  }
  
  // Create a new Connect account using the Accounts API
  const account = await stripe.accounts.create({
    type: 'express',
    email: currentUser.email,
    metadata: {
      userId: currentUser.id,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })
  
  // Save the account ID to the user
  await db
    .update(user)
    .set({ stripeAccountId: account.id })
    .where(eq(user.id, currentUser.id))
  
  return { accountId: account.id }
}

export async function createConnectOnboardingLink(returnUrl: string) {
  const currentUser = await getUser()
  
  // Get user's Stripe account
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1)
  
  if (!dbUser?.stripeAccountId) {
    throw new Error('No Stripe account found. Please create one first.')
  }
  
  // Create an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: dbUser.stripeAccountId,
    refresh_url: `${returnUrl}?refresh=true`,
    return_url: `${returnUrl}?success=true`,
    type: 'account_onboarding',
  })
  
  return { url: accountLink.url }
}

export async function getConnectAccountStatus() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    return { 
      isAuthenticated: false,
      hasAccount: false, 
      isOnboarded: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    }
  }
  
  // Get user's Stripe account
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  
  if (!dbUser?.stripeAccountId) {
    return { 
      isAuthenticated: true,
      hasAccount: false, 
      isOnboarded: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    }
  }
  
  // Get account details from Stripe
  const account = await stripe.accounts.retrieve(dbUser.stripeAccountId)
  
  return {
    isAuthenticated: true,
    hasAccount: true,
    isOnboarded: account.details_submitted ?? false,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    accountId: account.id,
  }
}

export async function createConnectLoginLink() {
  const currentUser = await getUser()
  
  // Get user's Stripe account
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1)
  
  if (!dbUser?.stripeAccountId) {
    throw new Error('No Stripe account found')
  }
  
  const loginLink = await stripe.accounts.createLoginLink(dbUser.stripeAccountId)
  
  return { url: loginLink.url }
}

export async function startCheckoutSession(guideId: number) {
  const userId = await getUserId()
  
  // Get the guide with seller info
  const [guideData] = await db
    .select({
      guide: guides,
      seller: user,
    })
    .from(guides)
    .innerJoin(user, eq(guides.userId, user.id))
    .where(and(eq(guides.id, guideId), eq(guides.isPublished, true)))
    .limit(1)
  
  if (!guideData) {
    throw new Error('Guide not found')
  }
  
  const { guide, seller } = guideData
  
  // Check if already purchased
  const [existingPurchase] = await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.guideId, guideId), eq(purchases.userId, userId)))
    .limit(1)
  
  if (existingPurchase) {
    throw new Error('Already purchased')
  }
  
  // Platform fee: 15% of the sale
  const platformFeePercent = 15
  const applicationFeeAmount = Math.round(guide.priceInCents * platformFeePercent / 100)
  
  // Build checkout session options
  const sessionOptions: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: guide.title,
            description: `${guide.city}, ${guide.country} - Curated local guide by ${seller.name}`,
          },
          unit_amount: guide.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      guideId: guideId.toString(),
      userId,
      sellerId: seller.id,
    },
  }
  
  // If seller has a connected Stripe account, use destination charges
  if (seller.stripeAccountId) {
    sessionOptions.payment_intent_data = {
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: seller.stripeAccountId,
      },
    }
  }
  
  const session = await stripe.checkout.sessions.create(sessionOptions)
  
  // Return both the client secret (for the embedded UI) and the session id
  // (so the client can confirm + record the purchase on completion).
  return { clientSecret: session.client_secret, sessionId: session.id }
}

/**
 * Idempotently records a purchase from a completed Stripe Checkout session.
 * Shared by the client-side completion handler and the webhook so a purchase
 * is recorded exactly once regardless of which path runs first.
 */
export async function recordPurchaseFromSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  
  if (session.payment_status !== 'paid') {
    return { recorded: false, reason: 'unpaid' as const }
  }
  
  const guideId = parseInt(session.metadata?.guideId || '0')
  const userId = session.metadata?.userId
  
  if (!guideId || !userId) {
    return { recorded: false, reason: 'invalid-metadata' as const }
  }
  
  // Idempotency guard: skip if this guide is already owned by this user.
  const [existingPurchase] = await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.guideId, guideId), eq(purchases.userId, userId)))
    .limit(1)
  
  if (existingPurchase) {
    return { recorded: true, guideId, alreadyExisted: true }
  }
  
  await db.insert(purchases).values({
    userId,
    guideId,
    stripeSessionId: session.id,
    amountPaid: session.amount_total || 0,
  })
  
  return { recorded: true, guideId, alreadyExisted: false }
}

export async function completeCheckout(sessionId: string) {
  const result = await recordPurchaseFromSession(sessionId)
  
  if (!result.recorded) {
    throw new Error(
      result.reason === 'unpaid' ? 'Payment not completed' : 'Invalid session metadata'
    )
  }
  
  return { guideId: result.guideId }
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    paymentStatus: session.payment_status,
  }
}
