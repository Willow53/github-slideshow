'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'

export function PurchaseButton({ 
  guideId, 
  price 
}: { 
  guideId: number
  price: number 
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePurchase = () => {
    if (!session?.user) {
      router.push('/sign-in')
      return
    }
    
    setLoading(true)
    router.push(`/guide/${guideId}/checkout`)
  }

  if (!session?.user) {
    return (
      <Button asChild className="w-full" size="lg">
        <Link href="/sign-in">Sign in to Purchase</Link>
      </Button>
    )
  }

  return (
    <Button 
      className="w-full" 
      size="lg"
      onClick={handlePurchase}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        `Purchase for $${(price / 100).toFixed(2)}`
      )}
    </Button>
  )
}
