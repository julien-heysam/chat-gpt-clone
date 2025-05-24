"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Folder, ChevronDown, Check } from "lucide-react"

interface FolderItem {
  id: string
  name: string
  conversationCount: number
}

interface FolderSelectProps {
  folders: FolderItem[]
  selectedFolderId?: string | null
  onFolderSelect: (folderId: string | null) => void
  placeholder?: string
  allowNone?: boolean
}

export function FolderSelect({ 
  folders, 
  selectedFolderId, 
  onFolderSelect, 
  placeholder = "Select folder",
  allowNone = false 
}: FolderSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null)

  useEffect(() => {
    if (selectedFolderId) {
      const folder = folders.find(f => f.id === selectedFolderId)
      setSelectedFolder(folder || null)
    } else {
      setSelectedFolder(null)
    }
  }, [selectedFolderId, folders])

  const handleFolderSelect = (folder: FolderItem | null) => {
    setSelectedFolder(folder)
    onFolderSelect(folder?.id || null)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-full justify-between text-left bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-white/60" />
          <span className="truncate">
            {selectedFolder ? selectedFolder.name : placeholder}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-white/20 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
            {allowNone && (
              <button
                className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center justify-between"
                onClick={() => handleFolderSelect(null)}
              >
                <span>No folder</span>
                {!selectedFolder && <Check className="h-4 w-4 text-primary" />}
              </button>
            )}
            
            {folders.length === 0 ? (
              <div className="px-3 py-2 text-sm text-white/50">
                No folders available
              </div>
            ) : (
              folders.map((folder) => (
                <button
                  key={folder.id}
                  className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center justify-between"
                  onClick={() => handleFolderSelect(folder)}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-white/60" />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  {selectedFolder?.id === folder.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
} 