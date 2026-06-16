import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getGuideWithPlaces, checkPurchase, isGuideOwner } from '@/app/actions/guides'
import { InteractiveMap } from './interactive-map'

export const dynamic = 'force-dynamic'

export default async function GuideMapPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const guideId = parseInt(id)
  
  const guideData = await getGuideWithPlaces(guideId)
  
  if (!guideData) {
    notFound()
  }

  // Check access
  const [hasPurchased, isOwner] = await Promise.all([
    checkPurchase(guideId),
    isGuideOwner(guideId),
  ])

  const hasAccess = hasPurchased || isOwner

  if (!hasAccess && guideData.isPublished) {
    redirect(`/guide/${guideId}`)
  }

  return (
    <div className="h-svh flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b bg-background/95 backdrop-blur flex items-center px-4 shrink-0 z-50">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/guide/${guideId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="font-semibold text-foreground text-sm">{guideData.title}</h1>
            <p className="text-xs text-muted-foreground">
              {guideData.city}, {guideData.country} - {guideData.places.length} places
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/guide/${guideId}`}>
            <List className="w-4 h-4 mr-2" />
            List View
          </Link>
        </Button>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <InteractiveMap places={guideData.places} />
      </div>
    </div>
  )
}
