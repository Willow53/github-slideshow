import { Suspense } from 'react'
import Link from 'next/link'
import { MapPin, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { getPublishedGuides } from '@/app/actions/guides'

export const dynamic = 'force-dynamic'

async function GuidesList({ search }: { search?: string }) {
  const guidesData = await getPublishedGuides(search)

  if (guidesData.length === 0) {
    return (
      <div className="text-center py-16">
        <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No guides found</h3>
        <p className="text-muted-foreground">
          {search ? `No guides match "${search}"` : 'Be the first to create a guide!'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {guidesData.map(({ guide, seller }) => (
        <Link key={guide.id} href={`/guide/${guide.id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 border-0 bg-card h-full">
            <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-primary/40" />
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
                <span className="text-sm text-muted-foreground">
                  By {seller.name}
                </span>
                <span className="font-semibold text-primary">
                  ${(guide.priceInCents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q: search } = await searchParams

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Explore Guides</h1>
            <p className="text-muted-foreground">
              Discover curated local guides from around the world
            </p>
          </div>

          {/* Search */}
          <form className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search by city, country, or title..."
                defaultValue={search}
                className="pl-10 h-12 bg-card border-border"
              />
            </div>
          </form>

          {/* Results */}
          <Suspense fallback={
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden border-0 bg-card animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-5 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </Card>
              ))}
            </div>
          }>
            <GuidesList search={search} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
