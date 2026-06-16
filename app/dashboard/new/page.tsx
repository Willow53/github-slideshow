'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { createGuide, addPlacesToGuide } from '@/app/actions/guides'
import { parseGoogleMapsUrl } from '@/app/actions/maps-parser'

export default function NewGuidePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [parsingUrl, setParsingUrl] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [price, setPrice] = useState('5.00')
  const [mapsUrl, setMapsUrl] = useState('')
  const [parsedPlaces, setParsedPlaces] = useState<Array<{
    name: string
    address?: string
    category?: string
    latitude?: string
    longitude?: string
  }>>([])

  const handleParseUrl = async () => {
    if (!mapsUrl) return
    
    setParsingUrl(true)
    setError(null)
    
    try {
      const places = await parseGoogleMapsUrl(mapsUrl)
      if (places.length > 0) {
        setParsedPlaces(places)
      } else {
        setError('Could not extract places from this URL. You can add places manually after creating the guide.')
      }
    } catch {
      setError('Failed to parse URL. Please check if it\'s a valid Google Maps list URL.')
    } finally {
      setParsingUrl(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const priceInCents = Math.round(parseFloat(price) * 100)
      
      if (priceInCents < 300 || priceInCents > 2000) {
        setError('Price must be between $3 and $20')
        setLoading(false)
        return
      }

      const guide = await createGuide({
        title,
        description: description || undefined,
        city,
        country,
        priceInCents,
        mapsUrl: mapsUrl || undefined,
      })

      if (parsedPlaces.length > 0) {
        await addPlacesToGuide(guide.id, parsedPlaces)
      }

      router.push(`/dashboard/${guide.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Guide</h1>
            <p className="text-muted-foreground">
              Share your local knowledge with travelers
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="p-6 mb-6">
              <h2 className="font-semibold text-lg mb-4 text-foreground">Guide Details</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Best Coffee Spots in Tokyo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell travelers what makes your guide special..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Tokyo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g., Japan"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="3"
                    max="20"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Between $3 and $20</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h2 className="font-semibold text-lg mb-4 text-foreground">Import from Google Maps</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Paste a shared Google Maps list URL to automatically import places
              </p>
              
              <div className="flex gap-2">
                <Input
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleParseUrl}
                  disabled={!mapsUrl || parsingUrl}
                >
                  {parsingUrl ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Import'
                  )}
                </Button>
              </div>

              {parsedPlaces.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium mb-2">
                    Found {parsedPlaces.length} places:
                  </p>
                  <ul className="text-sm text-green-600 space-y-1">
                    {parsedPlaces.slice(0, 5).map((place, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {place.name}
                      </li>
                    ))}
                    {parsedPlaces.length > 5 && (
                      <li className="text-green-500">
                        +{parsedPlaces.length - 5} more places
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-3">
                Note: You can also add places manually after creating the guide
              </p>
            </Card>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Guide'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
