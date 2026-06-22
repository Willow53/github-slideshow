import Link from 'next/link'
import { MapPin, ArrowLeft, Compass } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { getGuidesByCity } from '@/app/actions/guides'

export const dynamic = 'force-dynamic'

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city: cityParam } = await params
  const city = decodeURIComponent(cityParam)
  const guidesData = await getGuidesByCity(city)
  const country = guidesData[0]?.guide.country

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Navbar />

      {/* City header */}
      <section className="bg-[#06201c] text-white">
        <div className="container mx-auto px-4 py-12">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-6 -ml-2 text-teal-200 hover:bg-white/10 hover:text-white"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to globe
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-teal-300">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">
              {country ?? 'Explore'}
            </span>
          </div>
          <h1 className="mt-2 text-balance text-4xl font-bold tracking-tight md:text-5xl">
            {city}
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-lg text-slate-300">
            {guidesData.length > 0
              ? `${guidesData.length} curated ${
                  guidesData.length === 1 ? 'guide' : 'guides'
                } from locals who know ${city} best.`
              : `No guides for ${city} just yet — be the first to share one.`}
          </p>
        </div>
      </section>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-10">
          {guidesData.length === 0 ? (
            <div className="py-16 text-center">
              <Compass className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
              <h3 className="mb-2 text-lg font-medium text-foreground">
                No guides for {city} yet
              </h3>
              <p className="mb-6 text-muted-foreground">
                Know this city well? Share your favorite spots and start earning.
              </p>
              <Button asChild>
                <Link href="/dashboard/new">Create a guide</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {guidesData.map(({ guide, seller }) => (
                <Link key={guide.id} href={`/guide/${guide.id}`}>
                  <Card className="h-full overflow-hidden border-0 bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                      <MapPin className="h-12 w-12 text-primary/40" />
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {guide.city}, {guide.country}
                      </div>
                      <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground">
                        {guide.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                        {guide.description || `Discover the best spots in ${guide.city}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">By {seller.name}</span>
                        <span className="font-semibold text-primary">
                          ${(guide.priceInCents / 100).toFixed(2)}
                        </span>
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
