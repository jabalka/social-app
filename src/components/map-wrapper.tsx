"use client"

import type React from "react"

import { useEffect, useState } from "react"

// Import types only
import type { FC } from "react"

interface MapWrapperProps {
  position: [number, number]
  onPick: (lat: number, lng: number) => void
}

// This component is a wrapper that ensures the map is only loaded client-side
const MapWrapper: FC<MapWrapperProps> = (props) => {
  const [isMounted, setIsMounted] = useState(false)
  const [MapComponent, setMapComponent] = useState<React.ComponentType<MapWrapperProps> | null>(null)

  useEffect(() => {
    setIsMounted(true)

    // Dynamically import the map component
    import("./map-component").then((module) => {
      setMapComponent(() => module.default)
    })

    return () => {
      setIsMounted(false)
      setMapComponent(null)
    }
  }, [])

  if (!isMounted || !MapComponent) {
    return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div>
  }

  return <MapComponent {...props} />
}

export default MapWrapper
