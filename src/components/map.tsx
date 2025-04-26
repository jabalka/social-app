"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"

// Make sure to import Leaflet CSS somewhere in your app
// import 'leaflet/dist/leaflet.css'

interface MapComponentProps {
  position: [number, number]
  onPick: (lat: number, lng: number) => void
}

const MapComponent : React.FC<MapComponentProps> = ({ position, onPick }) => {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)

  // Initialize map when component mounts
  useEffect(() => {
    if (typeof window === "undefined") return

    // Clean up function to destroy the map instance
    const cleanup = () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }

    // Clean up previous map instance if it exists
    cleanup()

    // Make sure the container exists
    if (!containerRef.current) return

    // Create a new map instance
    const map = L.map(containerRef.current).setView(position, 13)
    mapRef.current = map

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map)

    // Create marker icon
    const icon = L.icon({
      iconUrl: "/images/marker-icon.png",
      iconSize: [60, 60],
      iconAnchor: [30, 60],
    })

    // Add marker
    markerRef.current = L.marker(position, { icon }).addTo(map)

    // Add click event
    map.on("click", (e) => {
      const { lat, lng } = e.latlng
      onPick(lat, lng)
      
      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      }
    })

    // Clean up on unmount
    return cleanup
  }, []) // Empty dependency array to ensure it only runs once

  // Update marker position when position prop changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    
    // Update marker position
    markerRef.current.setLatLng(position)
    
    // Center map on marker
    mapRef.current.setView(position, mapRef.current.getZoom())
  }, [position])

  return <div ref={containerRef} className="h-full w-full" />
}

export default MapComponent
