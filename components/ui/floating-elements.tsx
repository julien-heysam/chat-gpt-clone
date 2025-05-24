"use client"

import { useEffect, useState } from "react"

export function FloatingElements() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Orbs */}
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
      <div className="floating-orb floating-orb-3" />
      
      {/* Morphing Blobs */}
      <div 
        className="morphing-blob"
        style={{
          width: '300px',
          height: '300px',
          top: '20%',
          left: '10%',
          animationDelay: '0s'
        }}
      />
      <div 
        className="morphing-blob"
        style={{
          width: '200px',
          height: '200px',
          bottom: '30%',
          right: '15%',
          animationDelay: '-10s'
        }}
      />
      
      {/* Shooting Stars */}
      <div className="shooting-star shooting-star-1" />
      <div className="shooting-star shooting-star-2" />
      <div className="shooting-star shooting-star-3" />
      <div className="shooting-star shooting-star-4" />
      <div className="shooting-star shooting-star-5" />
      
      {/* Additional geometric shapes */}
      <div className="absolute top-1/4 right-1/3 w-4 h-4 border border-white/20 rotate-45 animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-6 h-6 border border-purple-400/30 rounded-full animate-ping" />
      <div className="absolute top-2/3 left-1/2 w-8 h-1 bg-gradient-to-r from-blue-400/30 to-purple-400/30 transform rotate-12 animate-pulse" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  )
} 