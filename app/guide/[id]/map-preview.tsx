'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

// Dynamically import map to avoid SSR issues
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

export function GuideMapPreview({ 
  places, 
  showAll 
}: { 
  places: Place[]
  showAll: boolean 
}) {
  // Filter places with valid coordinates
  const placesWithCoords = places.filter(
    (p) => p.latitude && p.longitude
  )

  if (placesWithCoords.length === 0) {
    return (
      <div className="aspect-[16/9] bg-secondary/50 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {showAll ? 'Map coordinates not available' : 'Map preview available after purchase'}
          </p>
        </div>
      </div>
    )
  }

  // Calculate center from places
  const latitudes = placesWithCoords.map((p) => parseFloat(p.latitude!))
  const longitudes = placesWithCoords.map((p) => parseFloat(p.longitude!))
  const centerLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length
  const centerLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length

  // Only show first place marker if not purchased
  const displayPlaces = showAll ? placesWithCoords : placesWithCoords.slice(0, 1)

  return (
    <div className="aspect-[16/9] relative">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {displayPlaces.map((place) => (
          <Marker
            key={place.id}
            position={[parseFloat(place.latitude!), parseFloat(place.longitude!)]}
          >
            {showAll && (
              <Popup>
                <div className="font-medium">{place.name}</div>
                {place.address && (
                  <div className="text-sm text-gray-600">{place.address}</div>
                )}
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
      
      {!showAll && (
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
      )}
    </div>
  )
}
