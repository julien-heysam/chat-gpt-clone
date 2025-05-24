"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, LogOut, Settings, UserCircle } from "lucide-react"

interface UserMenuProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  const handleSettings = () => {
    router.push("/settings")
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-3 py-2 glass-effect rounded-lg border border-white/10">
        <div className="w-10 h-10 rounded-full glass-effect flex items-center justify-center border border-primary/30 neon-glow">
          {user?.image ? (
            <img 
              src={user.image} 
              alt={user.name || "User"} 
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <UserCircle className="h-6 w-6 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate text-white">
            {user?.name || "Neural User"}
          </div>
          <div className="text-xs text-white/60 truncate">
            {user?.email || "guest@neural.chat"}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 gap-2 glass-effect hover:glass-effect hover:bg-white/10 transition-all duration-300 text-white/70 hover:text-white border border-white/20 hover:border-primary/50"
          onClick={handleSettings}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 gap-2 glass-effect hover:glass-effect hover:bg-red-500/20 transition-all duration-300 text-white/70 hover:text-red-300 border border-white/20 hover:border-red-400/50"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
} 