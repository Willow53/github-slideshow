import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { getGuideWithPlaces } from '@/app/actions/guides'
import { EditGuideForm } from './edit-form'

export const dynamic = 'force-dynamic'

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const { id } = await params
  const guideId = parseInt(id)
  
  const guideData = await getGuideWithPlaces(guideId)
  
  if (!guideData || guideData.userId !== session.user.id) {
    notFound()
  }

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Edit Guide</h1>
            <p className="text-muted-foreground">
              Update your guide details and manage places
            </p>
          </div>

          <EditGuideForm guide={guideData} places={guideData.places} />
        </div>
      </main>
    </div>
  )
}
