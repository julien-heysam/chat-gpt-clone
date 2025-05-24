"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen relative">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="animate-spin rounded-full h-32 w-32 border-2 border-transparent border-t-purple-500 border-r-blue-500"></div>
          {/* Inner pulsing orb */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 animate-pulse"></div>
          {/* Center dot */}
          <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white animate-ping"></div>
        </div>
        <div className="absolute bottom-1/3 text-white/60 text-lg font-medium animate-pulse">
          Neural Chat Loading...
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return <ChatInterface />
}
