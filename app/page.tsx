"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return <ChatInterface />
}
