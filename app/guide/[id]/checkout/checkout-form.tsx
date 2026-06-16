'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { startCheckoutSession, completeCheckout } from '@/app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CheckoutForm({ guideId }: { guideId: number }) {
  const router = useRouter()
  const [status, setStatus] = useState<'checkout' | 'processing' | 'complete' | 'error'>('checkout')
  const [error, setError] = useState<string | null>(null)
  // Captured when the session is created so onComplete can record reliably,
  // since embedded checkout never navigates and exposes no session_id in the URL.
  const sessionIdRef = useRef<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    const { clientSecret, sessionId } = await startCheckoutSession(guideId)
    sessionIdRef.current = sessionId
    if (!clientSecret) {
      throw new Error('Failed to start checkout session')
    }
    return clientSecret
  }, [guideId])

  const goToGuide = useCallback(() => {
    router.push(`/guide/${guideId}`)
    router.refresh()
  }, [guideId, router])

  const handleComplete = useCallback(async () => {
    setStatus('processing')

    try {
      const sessionId = sessionIdRef.current
      if (sessionId) {
        // Records the purchase server-side (idempotent). The webhook is the
        // production backstop in case this call doesn't run.
        await completeCheckout(sessionId)
      }
    } catch (err) {
      // The webhook will still record the purchase, so we don't block the user.
      console.error('[v0] Error completing checkout:', err)
    } finally {
      setStatus('complete')
      setTimeout(goToGuide, 2000)
    }
  }, [goToGuide])

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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => setError(null)}>Try Again</Button>
      </div>
    )
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ 
          fetchClientSecret,
          onComplete: handleComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
