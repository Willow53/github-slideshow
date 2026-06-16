import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, ExternalLink, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { getMyPurchases } from '@/app/actions/guides'

export const dynamic = 'force-dynamic'

export default async function PurchasesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const purchases = await getMyPurchases()

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Purchases</h1>
            <p className="text-muted-foreground">
              Access all the guides you have purchased
            </p>
          </div>

          {/* Purchases List */}
          {purchases.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-6">
                Browse guides from locals around the world
              </p>
              <Button asChild>
                <Link href="/explore">Explore Guides</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map(({ purchase, guide }) => (
                <Link key={purchase.id} href={`/guide/${guide.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 border-0 bg-card h-full">
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                      <MapPin className="w-12 h-12 text-primary/40" />
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Purchased
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        {guide.city}, {guide.country}
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {guide.description || `Discover the best spots in ${guide.city}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Purchased {new Date(purchase.createdAt).toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
