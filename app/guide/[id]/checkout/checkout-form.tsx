'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { startCheckoutSession, completeCheckout } from '@/app/actions/stripe'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

// Cache one Stripe.js instance per account context (platform vs. each connected
// account) so we don't reload the script on every render.
const stripeCache = new Map<string, Promise<Stripe | null>>()
function getStripePromise(connectedAccountId: string | null) {
  const key = connectedAccountId ?? 'platform'
  if (!stripeCache.has(key)) {
    stripeCache.set(
      key,
      connectedAccountId
        ? loadStripe(publishableKey, { stripeAccount: connectedAccountId })
        : loadStripe(publishableKey)
    )
  }
  return stripeCache.get(key)!
}

export function CheckoutForm({ guideId }: { guideId: number }) {
  const router = useRouter()
  const [status, setStatus] = useState<'init' | 'checkout' | 'processing' | 'complete' | 'error'>('init')
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  // Create the checkout session once on mount. We need the connected account id
  // up front so Stripe.js can be initialized against the right account for
  // direct charges.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await startCheckoutSession(guideId)
        if (cancelled) return
        sessionIdRef.current = result.sessionId
        setConnectedAccountId(result.connectedAccountId)
        setClientSecret(result.clientSecret)
        setStatus('checkout')
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to start checkout')
        setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [guideId])

  const stripePromise = useMemo(
    () => (status === 'checkout' ? getStripePromise(connectedAccountId) : null),
    [status, connectedAccountId]
  )

  const goToGuide = useCallback(() => {
    router.push(`/guide/${guideId}`)
    router.refresh()
  }, [guideId, router])

  const handleComplete = useCallback(async () => {
    setStatus('processing')
    try {
      const sessionId = sessionIdRef.current
      if (sessionId) {
        // Idempotent server-side recording. The webhook is the production
        // backstop in case this call doesn't run.
        await completeCheckout(sessionId, connectedAccountId)
      }
    } catch (err) {
      // The webhook will still record the purchase, so we don't block the user.
      console.error('[v0] Error completing checkout:', err)
    } finally {
      setStatus('complete')
      setTimeout(goToGuide, 2000)
    }
  }, [connectedAccountId, goToGuide])

  if (status === 'init') {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground">Preparing checkout...</p>
      </div>
    )
  }

  if (status === 'processing') {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground">Processing payment...</p>
        <p className="text-sm text-muted-foreground">Please wait while we confirm your purchase</p>
      </div>
    )
  }

  if (status === 'complete') {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground">Purchase Complete!</p>
        <p className="text-sm text-muted-foreground mb-4">Redirecting to your guide...</p>
        <Button onClick={() => router.push(`/guide/${guideId}`)}>
          View Guide Now
        </Button>
      </div>
    )
  }

  if (status === 'error' || error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error ?? 'Something went wrong'}</p>
        <Button onClick={() => router.push(`/guide/${guideId}`)}>Back to Guide</Button>
      </div>
    )
  }

  return (
    <div id="checkout">
      {stripePromise && clientSecret && (
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            clientSecret,
            onComplete: handleComplete,
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </div>
  )
}
