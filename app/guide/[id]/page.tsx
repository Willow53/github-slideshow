import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, User, Clock, Lock, ArrowLeft, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { getGuideWithPlaces, checkPurchase, isGuideOwner } from '@/app/actions/guides'
import { PurchaseButton } from './purchase-button'
import { GuideMapPreview } from './map-preview'

export const dynamic = 'force-dynamic'

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const guideId = parseInt(id)
  
  const guideData = await getGuideWithPlaces(guideId)
  
  if (!guideData || !guideData.isPublished) {
    notFound()
  }

  const [hasPurchased, isOwner] = await Promise.all([
    checkPurchase(guideId),
    isGuideOwner(guideId),
  ])

  const hasAccess = hasPurchased || isOwner

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/explore">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  {guideData.city}, {guideData.country}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {guideData.title}
                </h1>
                {guideData.description && (
                  <p className="text-lg text-muted-foreground">
                    {guideData.description}
                  </p>
                )}
              </div>

              {/* Seller Info */}
              <Card className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created by</p>
                  <p className="font-medium text-foreground">{guideData.seller?.name}</p>
                </div>
              </Card>

              {/* Map Preview or Full View */}
              <Card className="overflow-hidden">
                <div className="p-4 border-b bg-secondary/30">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {guideData.places.length} Places Included
                  </h2>
                </div>
                
                {hasAccess ? (
                  <div>
                    <GuideMapPreview places={guideData.places} showAll />
                    <div className="p-4 space-y-2">
                      {guideData.places.map((place) => (
                        <div 
                          key={place.id} 
                          className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg"
                        >
                          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-foreground">{place.name}</p>
                            {place.address && (
                              <p className="text-sm text-muted-foreground">{place.address}</p>
                            )}
                            {place.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{place.notes}</p>
                            )}
                          </div>
                          {place.category && (
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full ml-auto">
                              {place.category}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <GuideMapPreview places={guideData.places} showAll={false} />
                    <div className="p-6 text-center">
                      <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-2">
                        Purchase this guide to see all {guideData.places.length} places
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Including addresses, notes, and interactive map
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    ${(guideData.priceInCents / 100).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">One-time purchase</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-foreground">{guideData.places.length} curated places</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-foreground">By local expert</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Instant access</span>
                  </div>
                </div>

                {hasAccess ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-green-700 font-medium">
                        {isOwner ? 'You own this guide' : 'You have access to this guide'}
                      </p>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/guide/${guideData.id}/map`}>
                        <Map className="w-4 h-4 mr-2" />
                        Open Interactive Map
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <PurchaseButton guideId={guideData.id} price={guideData.priceInCents} />
                )}

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure payment via Stripe
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
