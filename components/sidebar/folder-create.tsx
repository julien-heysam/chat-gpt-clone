"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FolderPlus, Loader2, X } from "lucide-react"

interface FolderCreateProps {
  onFolderCreated: (folder: { id: string; name: string; systemPrompt?: string | null; conversationCount: number }) => void
}

export function FolderCreate({ onFolderCreated }: FolderCreateProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!folderName.trim()) {
      setError("Folder name is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: folderName.trim(),
          systemPrompt: systemPrompt.trim() || null
        }),
      })

      if (response.ok) {
        const newFolder = await response.json()
        onFolderCreated(newFolder)
        setFolderName("")
        setSystemPrompt("")
        setIsOpen(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create folder")
      }
    } catch (error) {
      console.error("Error creating folder:", error)
      setError("Failed to create folder")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFolderName("")
    setSystemPrompt("")
    setIsOpen(false)
    setError("")
  }

  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-white/20 rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Create New Folder</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/10"
              onClick={handleClose}
            >
              <X className="h-4 w-4 text-white/60" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="folder-name" className="block text-sm font-medium text-white/80">
                Folder Name
              </label>
              <Input
                id="folder-name"
                type="text"
                placeholder="Enter folder name..."
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-primary/50"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="system-prompt" className="block text-sm font-medium text-white/80">
                Instructions (Optional)
              </label>
              <Textarea
                id="system-prompt"
                placeholder="Enter instructions for conversations in this folder..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-primary/50 min-h-[100px] resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-white/50">
                These instructions will guide the AI in all conversations within this folder.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !folderName.trim()}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Folder
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 hover:bg-white/10 transition-colors"
      onClick={() => setIsOpen(true)}
    >
      <FolderPlus className="h-4 w-4 text-white/60 hover:text-primary transition-colors" />
    </Button>
  )
} 