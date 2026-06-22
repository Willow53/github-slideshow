'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CityWithGuides } from '@/app/actions/guides'

const GlobeScene = dynamic(() => import('./globe-scene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
    </div>
  ),
})

export function GlobeHero({ cities }: { cities: CityWithGuides[] }) {
  const hasCities = cities.length > 0

  return (
    <section className="relative overflow-hidden bg-[#06201c]">
      {/* Globe canvas */}
      <div className="absolute inset-0 h-full w-full">
        {hasCities ? (
          <GlobeScene cities={cities} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          </div>
        )}
      </div>

      {/* Gradient overlays for text legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#06201c] via-transparent to-[#06201c]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#06201c] to-transparent" />

      {/* Headline content */}
      <div className="relative mx-auto flex min-h-[88vh] max-w-5xl flex-col items-center justify-between px-4 py-16 text-center">
        <div className="pointer-events-none max-w-2xl pt-8">
          <span className="pointer-events-auto mb-5 inline-flex items-center rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-1.5 text-sm font-medium text-teal-200">
            Local knowledge, curated by people who live there
          </span>
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            Explore cities through the eyes of a local
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-slate-300">
            Spin the globe and tap a city to unlock hand-picked Google Maps lists of the best
            food, bars, and hidden gems — straight from the people who live there.
          </p>
        </div>

        {/* Bottom cue + actions */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-sm text-teal-200/80">
            {hasCities
              ? 'Drag to spin · Tap a glowing point to explore'
              : 'New guides are being added — check back soon'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-teal-500 text-white hover:bg-teal-400">
              <Link href="/explore">
                Browse all guides
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/dashboard/new">Sell your list</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
