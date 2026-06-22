import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { recordPurchaseFromSession } from '@/app/actions/stripe'
import type Stripe from 'stripe'

// Stripe requires the raw, unparsed request body for signature verification.
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // Without a configured signing secret we cannot trust the payload, so we
  // refuse to process it. The client-side completion handler still records
  // purchases in environments where the webhook isn't wired up yet.
  if (!webhookSecret) {
    console.error('[v0] STRIPE_WEBHOOK_SECRET is not set; ignoring webhook')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 400 }
    )
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const body = await req.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[v0] Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        // For direct charges the event is delivered on behalf of the connected
        // account, so event.account tells us where the session lives.
        const result = await recordPurchaseFromSession(session.id, event.account)
        console.log('[v0] Webhook recorded purchase:', result)
        break
      }
      default:
        // Ignore unhandled event types.
        break
    }
  } catch (err) {
    console.error('[v0] Error handling webhook event:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
