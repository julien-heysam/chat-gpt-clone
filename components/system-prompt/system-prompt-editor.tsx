"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Settings, X, Edit3, Loader2 } from "lucide-react"

interface SystemPromptEditorProps {
  title: string
  currentPrompt?: string | null
  placeholder?: string
  onSave: (prompt: string) => Promise<void>
  isGlobal?: boolean
  compact?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function SystemPromptEditor({ 
  title, 
  currentPrompt, 
  placeholder = "Enter instructions for the AI assistant...",
  onSave,
  isGlobal = false,
  compact = false,
  isOpen = false,
  onClose
}: SystemPromptEditorProps) {
  const [isEditing, setIsEditing] = useState(isOpen)
  const [prompt, setPrompt] = useState(currentPrompt || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Update internal state when isOpen prop changes
  useEffect(() => {
    setIsEditing(isOpen)
    if (isOpen) {
      setPrompt(currentPrompt || "")
      setError("")
    }
  }, [isOpen, currentPrompt])

  const handleSave = async () => {
    setIsLoading(true)
    setError("")

    try {
      await onSave(prompt)
      setIsEditing(false)
      onClose?.()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save instructions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setPrompt(currentPrompt || "")
    setError("")
    setIsEditing(false)
    onClose?.()
  }

  if (!compact) {
    if (!isEditing) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-white/20 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              {title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/10"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 text-white/60" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Instructions
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={placeholder}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-primary/50 min-h-[200px] resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-white/50">
                These instructions will be included in every conversation {isGlobal ? "by default" : "in this folder"}.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Instructions
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isEditing) {
    return (
      <div className="group">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-white/20 text-white/60 hover:text-white transition-all duration-200 rounded-md"
          onClick={() => setIsEditing(true)}
          title={currentPrompt ? `Edit ${title}` : `Add ${title}`}
        >
          {currentPrompt ? (
            <Settings className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Edit3 className="h-3.5 w-3.5 text-white/50 hover:text-white/80" />
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-white/20 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10"
            onClick={handleCancel}
          >
            <X className="h-4 w-4 text-white/60" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              Instructions
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-primary/50 min-h-[200px] resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-white/50">
              These instructions will be included in every conversation {isGlobal ? "by default" : "in this folder"}.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isLoading}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Instructions
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 