'use client'

import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Stars } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'
import type { CityWithGuides } from '@/app/actions/guides'

const GLOBE_RADIUS = 1
const MARKER_RADIUS = 1.012

// Convert latitude/longitude to a 3D position on the sphere surface.
function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`
}

function CityMarker({
  city,
  onSelect,
}: {
  city: CityWithGuides
  onSelect: (city: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const ringRef = useRef<THREE.Mesh>(null)
  const position = useMemo(
    () => latLngToVector3(city.lat ?? 0, city.lng ?? 0, MARKER_RADIUS),
    [city.lat, city.lng]
  )
  // Orient the marker so it sits flat against the globe surface.
  const quaternion = useMemo(() => {
    const up = new THREE.Vector3(0, 0, 1)
    const dir = position.clone().normalize()
    return new THREE.Quaternion().setFromUnitVectors(up, dir)
  }, [position])

  useFrame((state) => {
    if (ringRef.current) {
      const t = state.clock.getElapsedTime()
      const pulse = 1 + Math.sin(t * 2.5) * 0.25
      ringRef.current.scale.set(pulse, pulse, pulse)
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.6 - (pulse - 1) * 1.2
    }
  })

  return (
    <group position={position} quaternion={quaternion}>
      {/* Pulsing ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.022, 0.032, 32]} />
        <meshBasicMaterial color="#f0c560" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Marker dot */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(city.city)
        }}
      >
        <sphereGeometry args={[hovered ? 0.026 : 0.018, 16, 16]} />
        <meshBasicMaterial color={hovered ? '#ffffff' : '#f0c560'} />
      </mesh>
      {hovered && (
        <Html distanceFactor={2.6} zIndexRange={[100, 0]} occlude>
          <button
            onClick={() => onSelect(city.city)}
            className="pointer-events-auto -translate-x-1/2 -translate-y-[140%] whitespace-nowrap rounded-lg border border-white/15 bg-slate-900/90 px-3 py-2 text-left shadow-xl backdrop-blur-sm"
          >
            <span className="block text-sm font-semibold text-white">{city.city}</span>
            <span className="block text-xs text-slate-300">
              {city.guideCount} {city.guideCount === 1 ? 'guide' : 'guides'} · from{' '}
              {formatPrice(city.minPrice)}
            </span>
          </button>
        </Html>
      )}
    </group>
  )
}

function Globe({ cities, onSelect }: { cities: CityWithGuides[]; onSelect: (city: string) => void }) {
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group ref={groupRef}>
      {/* Solid base sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial color="#0d3b34" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Lat/long wireframe grid */}
      <mesh scale={1.003}>
        <sphereGeometry args={[GLOBE_RADIUS, 24, 24]} />
        <meshBasicMaterial color="#2dd4bf" wireframe transparent opacity={0.12} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh scale={1.18}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshBasicMaterial color="#2dd4bf" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      {cities.map((c) => (
        <CityMarker key={`${c.city}-${c.country}`} city={c} onSelect={onSelect} />
      ))}
    </group>
  )
}

export default function GlobeScene({ cities }: { cities: CityWithGuides[] }) {
  const router = useRouter()
  const handleSelect = (city: string) => {
    router.push(`/city/${encodeURIComponent(city)}`)
  }

  return (
    <Canvas camera={{ position: [0, 0.3, 3.2], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 3, 5]} intensity={1.2} />
      <pointLight position={[-5, -2, -5]} intensity={0.4} color="#2dd4bf" />
      <Stars radius={50} depth={30} count={1500} factor={3} saturation={0} fade speed={1} />
      <Globe cities={cities} onSelect={handleSelect} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.45}
        autoRotate
        autoRotateSpeed={0.45}
      />
    </Canvas>
  )
}
