import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Plus, Edit, ExternalLink, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { getMyGuides, getPlacesForGuide } from '@/app/actions/guides'
import { getConnectAccountStatus } from '@/app/actions/stripe'
import { DeleteGuideButton, TogglePublishButton } from './actions-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const [guides, connectStatus] = await Promise.all([
    getMyGuides(),
    getConnectAccountStatus()
  ])

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Stripe Connect Status Banner */}
          {!connectStatus.isOnboarded && (
            <Card className="p-4 mb-6 border-amber-200 bg-amber-50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">Set up payments to receive earnings</p>
                    <p className="text-sm text-amber-700">
                      Connect your Stripe account to start receiving payouts when someone buys your guides.
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-300 hover:bg-amber-100">
                  <Link href="/dashboard/connect">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Set Up Payments
                  </Link>
                </Button>
              </div>
            </Card>
          )}
          
          {connectStatus.isOnboarded && (
            <Card className="p-4 mb-6 border-green-200 bg-green-50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">Payments enabled</p>
                    <p className="text-sm text-green-700">
                      You&apos;ll receive 85% of each sale directly to your bank account.
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0 border-green-300 hover:bg-green-100">
                  <Link href="/dashboard/connect">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Payments
                  </Link>
                </Button>
              </div>
            </Card>
          )}
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Guides</h1>
              <p className="text-muted-foreground">
                Create and manage your city guides
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/new">
                <Plus className="w-4 h-4 mr-2" />
                New Guide
              </Link>
            </Button>
          </div>

          {/* Guides List */}
          {guides.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No guides yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first guide to share your local knowledge
              </p>
              <Button asChild>
                <Link href="/dashboard/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Guide
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {await Promise.all(guides.map(async (guide) => {
                const places = await getPlacesForGuide(guide.id)
                return (
                  <Card key={guide.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-foreground truncate">
                            {guide.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            guide.isPublished 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {guide.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {guide.city}, {guide.country}
                          </span>
                          <span>{places.length} places</span>
                          <span>${(guide.priceInCents / 100).toFixed(2)}</span>
                        </div>
                        {guide.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                            {guide.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/${guide.id}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        {guide.isPublished && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/guide/${guide.id}`}>
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        )}
                        <TogglePublishButton 
                          guideId={guide.id} 
                          isPublished={guide.isPublished}
                          disabled={places.length === 0}
                        />
                        <DeleteGuideButton guideId={guide.id} title={guide.title} />
                      </div>
                    </div>
                  </Card>
                )
              }))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
