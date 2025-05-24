"use client"

import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"

interface NewConversationProps {
  onCreateConversation: () => Promise<void>
  isLoading?: boolean
}

export function NewConversation({ onCreateConversation, isLoading = false }: NewConversationProps) {
  const handleCreate = () => {
    onCreateConversation()
  }

  return (
    <Button 
      onClick={handleCreate}
      disabled={isLoading}
      className="w-full justify-start gap-3 glass-effect hover:glass-effect hover:bg-white/10 transition-all duration-300 text-white border-primary/30 hover:border-primary/50 group"
      variant="outline"
    >
      <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
      <span className="font-medium">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
        New Conversation
      </span>
    </Button>
  )
} 