'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, X, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Dynamically import map components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface Place {
  id: number
  name: string
  address: string | null
  latitude: string | null
  longitude: string | null
  category: string | null
  notes: string | null
}

export function InteractiveMap({ places }: { places: Place[] }) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter places with valid coordinates
  const placesWithCoords = places.filter(
    (p) => p.latitude && p.longitude
  )

  if (placesWithCoords.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-secondary/30">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">No map data available</p>
          <p className="text-muted-foreground">
            This guide doesn&apos;t have location coordinates for its places
          </p>
        </div>
      </div>
    )
  }

  // Calculate bounds
  const latitudes = placesWithCoords.map((p) => parseFloat(p.latitude!))
  const longitudes = placesWithCoords.map((p) => parseFloat(p.longitude!))
  const centerLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length
  const centerLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-secondary/30">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full relative">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {placesWithCoords.map((place) => (
          <Marker
            key={place.id}
            position={[parseFloat(place.latitude!), parseFloat(place.longitude!)]}
            eventHandlers={{
              click: () => setSelectedPlace(place),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-foreground">{place.name}</h3>
                {place.address && (
                  <p className="text-sm text-muted-foreground mt-1">{place.address}</p>
                )}
                {place.category && (
                  <span className="inline-block text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full mt-2">
                    {place.category}
                  </span>
                )}
                {place.notes && (
                  <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{place.notes}</p>
                )}
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
                      '_blank'
                    )
                  }}
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Get Directions
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Places sidebar */}
      <div className="absolute left-4 top-4 bottom-4 w-80 z-10 pointer-events-none">
        <Card className="h-full overflow-hidden pointer-events-auto shadow-lg">
          <div className="p-4 border-b bg-card">
            <h2 className="font-semibold text-foreground">Places ({placesWithCoords.length})</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-57px)]">
            {placesWithCoords.map((place) => (
              <button
                key={place.id}
                className={`w-full text-left p-4 border-b hover:bg-secondary/50 transition-colors ${
                  selectedPlace?.id === place.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
                onClick={() => setSelectedPlace(place)}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{place.name}</p>
                    {place.address && (
                      <p className="text-sm text-muted-foreground truncate">{place.address}</p>
                    )}
                    {place.category && (
                      <span className="inline-block text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full mt-1">
                        {place.category}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Selected place detail panel (mobile) */}
      {selectedPlace && (
        <div className="absolute left-4 right-4 bottom-4 z-20 md:hidden">
          <Card className="p-4 shadow-lg">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground">{selectedPlace.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 -mr-2 -mt-2"
                onClick={() => setSelectedPlace(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {selectedPlace.address && (
              <p className="text-sm text-muted-foreground mb-2">{selectedPlace.address}</p>
            )}
            {selectedPlace.notes && (
              <p className="text-sm text-muted-foreground mb-3">{selectedPlace.notes}</p>
            )}
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.latitude},${selectedPlace.longitude}`,
                  '_blank'
                )
              }}
            >
              <Navigation className="w-3 h-3 mr-1" />
              Get Directions
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
