"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FolderSelect } from "./folder-select"
import { FolderInput, Loader2, X } from "lucide-react"

interface FolderItem {
  id: string
  name: string
  conversationCount: number
}

interface Conversation {
  id: string
  title: string
  folderId?: string | null
}

interface MoveConversationProps {
  conversation: Conversation
  folders: FolderItem[]
  onMoveSuccess: (conversationId: string, folderId: string | null) => void
  onClose: () => void
}

export function MoveConversation({ 
  conversation, 
  folders, 
  onMoveSuccess, 
  onClose 
}: MoveConversationProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    conversation.folderId || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleMove = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/conversations/${conversation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderId: selectedFolderId }),
      })

      if (response.ok) {
        onMoveSuccess(conversation.id, selectedFolderId)
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to move conversation")
      }
    } catch (error) {
      console.error("Error moving conversation:", error)
      setError("Failed to move conversation")
    } finally {
      setIsLoading(false)
    }
  }

  const hasChanged = selectedFolderId !== conversation.folderId

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-white/20 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Move Conversation</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-white/60" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-white/80 mb-3">
              Moving: <span className="font-medium text-white">{conversation.title}</span>
            </p>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Select destination folder
              </label>
              <FolderSelect
                folders={folders}
                selectedFolderId={selectedFolderId}
                onFolderSelect={setSelectedFolderId}
                placeholder="Choose folder or no folder"
                allowNone={true}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={isLoading || !hasChanged}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Move
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 