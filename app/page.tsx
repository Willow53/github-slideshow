import Link from 'next/link'
import { MapPin, Star, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { getPublishedGuides, getCitiesWithGuides } from '@/app/actions/guides'
import { GlobeHero } from '@/components/globe/globe-hero'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [guidesData, cities] = await Promise.all([
    getPublishedGuides(),
    getCitiesWithGuides(),
  ])
  const featuredGuides = guidesData.slice(0, 3)

  return (
    <div className="min-h-svh flex flex-col">
      <Navbar />

      {/* Interactive Globe Hero */}
      <GlobeHero cities={cities} />

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Connect with locals and get authentic recommendations in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Find Your Destination</h3>
              <p className="text-muted-foreground text-sm">
                Browse guides by city or search for your next travel destination
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Choose a Local Guide</h3>
              <p className="text-muted-foreground text-sm">
                Each guide is curated by someone who lives or has lived in that city
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Get Instant Access</h3>
              <p className="text-muted-foreground text-sm">
                View places on an interactive map and share with your travel companions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      {featuredGuides.length > 0 && (
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Featured guides</h2>
                <p className="text-muted-foreground">Discover what locals recommend</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/explore">View All</Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {featuredGuides.map(({ guide, seller }) => (
                <Link key={guide.id} href={`/guide/${guide.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 bg-card">
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
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Know your city? Start earning.
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Share your favorite spots and earn money helping travelers discover 
            the authentic side of your city.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/sign-up">
              Create Your First Guide
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">CityGuides</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting travelers with local knowledge
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
