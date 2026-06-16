'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { startCheckoutSession, completeCheckout, getCheckoutSession } from '@/app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CheckoutForm({ guideId }: { guideId: number }) {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'checkout' | 'processing' | 'complete' | 'error'>('checkout')
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(
    () => startCheckoutSession(guideId),
    [guideId]
  )

  const handleComplete = useCallback(async () => {
    setStatus('processing')
    
    // Poll for session completion
    const maxAttempts = 10
    let attempts = 0
    
    const pollSession = async () => {
      try {
        // Get the session ID from URL or storage
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session_id')
        
        if (sessionId) {
          const session = await getCheckoutSession(sessionId)
          
          if (session.paymentStatus === 'paid') {
            await completeCheckout(sessionId)
            setStatus('complete')
            setTimeout(() => {
              router.push(`/guide/${guideId}`)
              router.refresh()
            }, 2000)
            return
          }
        }
        
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(pollSession, 1000)
        } else {
          // Just redirect - the webhook will handle recording the purchase
          setStatus('complete')
          setTimeout(() => {
            router.push(`/guide/${guideId}`)
            router.refresh()
          }, 2000)
        }
      } catch (err) {
        console.error('Error completing checkout:', err)
        setStatus('complete')
        setTimeout(() => {
          router.push(`/guide/${guideId}`)
          router.refresh()
        }, 2000)
      }
    }
    
    pollSession()
  }, [guideId, router])

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
