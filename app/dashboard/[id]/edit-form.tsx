'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin, Plus, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { updateGuide, addPlacesToGuide } from '@/app/actions/guides'
import { parseGoogleMapsUrl } from '@/app/actions/maps-parser'

interface Place {
  id: number
  guideId: number
  name: string
  address: string | null
  category: string | null
  notes: string | null
  latitude: string | null
  longitude: string | null
  placeId: string | null
  createdAt: Date
}

interface Guide {
  id: number
  userId: string
  title: string
  description: string | null
  city: string
  country: string
  priceInCents: number
  coverImage: string | null
  mapsUrl: string | null
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export function EditGuideForm({ 
  guide, 
  places: initialPlaces 
}: { 
  guide: Guide
  places: Place[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [parsingUrl, setParsingUrl] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [title, setTitle] = useState(guide.title)
  const [description, setDescription] = useState(guide.description || '')
  const [city, setCity] = useState(guide.city)
  const [country, setCountry] = useState(guide.country)
  const [price, setPrice] = useState((guide.priceInCents / 100).toFixed(2))
  const [mapsUrl, setMapsUrl] = useState(guide.mapsUrl || '')
  const [places, setPlaces] = useState(initialPlaces)
  
  const [newPlaces, setNewPlaces] = useState<Array<{
    name: string
    address?: string
    category?: string
    notes?: string
  }>>([])

  const handleParseUrl = async () => {
    if (!mapsUrl) return
    
    setParsingUrl(true)
    setError(null)
    
    try {
      const parsedPlaces = await parseGoogleMapsUrl(mapsUrl)
      if (parsedPlaces.length > 0) {
        setNewPlaces(parsedPlaces.map(p => ({
          name: p.name,
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
        })))
        setSuccess(`Found ${parsedPlaces.length} new places`)
      } else {
        setError('Could not extract places from this URL')
      }
    } catch {
      setError('Failed to parse URL')
    } finally {
      setParsingUrl(false)
    }
  }

  const handleAddManualPlace = () => {
    setNewPlaces([...newPlaces, { name: '', address: '', category: '', notes: '' }])
  }

  const handleUpdateNewPlace = (index: number, field: string, value: string) => {
    const updated = [...newPlaces]
    updated[index] = { ...updated[index], [field]: value }
    setNewPlaces(updated)
  }

  const handleRemoveNewPlace = (index: number) => {
    setNewPlaces(newPlaces.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const priceInCents = Math.round(parseFloat(price) * 100)
      
      if (priceInCents < 300 || priceInCents > 2000) {
        setError('Price must be between $3 and $20')
        setSaving(false)
        return
      }

      await updateGuide(guide.id, {
        title,
        description: description || undefined,
        city,
        country,
        priceInCents,
        mapsUrl: mapsUrl || undefined,
      })

      // Add new places if any
      const validNewPlaces = newPlaces.filter(p => p.name.trim())
      if (validNewPlaces.length > 0) {
        await addPlacesToGuide(guide.id, validNewPlaces)
        setNewPlaces([])
      }

      setSuccess('Guide saved successfully')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4 text-foreground">Guide Details</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
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
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-foreground">
            Places ({places.length})
          </h2>
        </div>

        {places.length > 0 ? (
          <div className="space-y-2 mb-6">
            {places.map((place) => (
              <div 
                key={place.id} 
                className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{place.name}</p>
                  {place.address && (
                    <p className="text-sm text-muted-foreground truncate">{place.address}</p>
                  )}
                </div>
                {place.category && (
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {place.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-6">No places added yet</p>
        )}

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4 text-foreground">Add More Places</h3>
          
          <div className="flex gap-2 mb-4">
            <Input
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="Paste Google Maps list URL..."
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline"
              onClick={handleParseUrl}
              disabled={!mapsUrl || parsingUrl}
            >
              {parsingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
            </Button>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddManualPlace}
            className="mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Place Manually
          </Button>

          {newPlaces.length > 0 && (
            <div className="space-y-3">
              {newPlaces.map((place, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">New Place {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveNewPlace(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Place name"
                    value={place.name}
                    onChange={(e) => handleUpdateNewPlace(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Address (optional)"
                    value={place.address || ''}
                    onChange={(e) => handleUpdateNewPlace(index, 'address', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Category (optional)"
                      value={place.category || ''}
                      onChange={(e) => handleUpdateNewPlace(index, 'category', e.target.value)}
                    />
                    <Input
                      placeholder="Notes (optional)"
                      value={place.notes || ''}
                      onChange={(e) => handleUpdateNewPlace(index, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
