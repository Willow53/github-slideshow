import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { getGuideById, checkPurchase } from '@/app/actions/guides'
import { CheckoutForm } from './checkout-form'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const { id } = await params
  const guideId = parseInt(id)
  
  const guide = await getGuideById(guideId)
  
  if (!guide || !guide.isPublished) {
    notFound()
  }

  // Check if already purchased
  const alreadyPurchased = await checkPurchase(guideId)
  if (alreadyPurchased) {
    redirect(`/guide/${guideId}`)
  }

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/guide/${guideId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Guide
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Purchase</h1>
            <p className="text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          </div>

          {/* Order Summary */}
          <Card className="p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4 text-foreground">Order Summary</h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{guide.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {guide.city}, {guide.country}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  ${(guide.priceInCents / 100).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">One-time</p>
              </div>
            </div>
          </Card>

          {/* Stripe Checkout */}
          <Card className="p-6">
            <CheckoutForm guideId={guideId} />
          </Card>
        </div>
      </main>
    </div>
  )
}
