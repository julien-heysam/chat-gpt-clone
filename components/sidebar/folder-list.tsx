"use client"

import { useState } from "react"
import { Folder, MoreHorizontal, FolderOpen, MessageSquare, Settings, Edit3, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FolderCreate } from "./folder-create"
import { SystemPromptEditor } from "../system-prompt/system-prompt-editor"

// NO SEPARATE EDIT INSTRUCTION BUTTONS - ONLY HOVER ICONS!

interface FolderItem {
  id: string
  name: string
  systemPrompt?: string | null
  conversationCount: number
}

interface FolderListProps {
  folders: FolderItem[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onFolderCreated: (folder: FolderItem) => void
  onFolderUpdated: (folder: FolderItem) => void
  onFolderDeleted?: (folderId: string) => void
  allConversationsCount: number
  globalSystemPrompt?: string | null
  onGlobalSystemPromptUpdated: (prompt: string | null) => void
}

export function FolderList({ 
  folders, 
  selectedFolderId, 
  onSelectFolder, 
  onFolderCreated, 
  onFolderUpdated,
  onFolderDeleted,
  allConversationsCount,
  globalSystemPrompt,
  onGlobalSystemPromptUpdated
}: FolderListProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<FolderItem | null>(null)
  const [renameFolder, setRenameFolder] = useState<FolderItem | null>(null)
  const [newFolderName, setNewFolderName] = useState("")

  const handleMenuClick = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation()
    setActiveMenuId(activeMenuId === folderId ? null : folderId)
  }

  const handleEditInstructions = (folderId: string) => {
    setEditingPromptId(folderId)
    setActiveMenuId(null)
  }

  const handleRenameClick = (folder: FolderItem) => {
    setRenameFolder(folder)
    setNewFolderName(folder.name)
    setActiveMenuId(null)
  }

  const handleRenameConfirm = async () => {
    if (!renameFolder || !newFolderName.trim()) return
    
    try {
      const response = await fetch(`/api/folders/${renameFolder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newFolderName.trim() }),
      })

      if (response.ok) {
        const updatedFolder = await response.json()
        onFolderUpdated(updatedFolder)
        setRenameFolder(null)
        setNewFolderName("")
      } else {
        const errorData = await response.json()
        alert(`Failed to rename folder: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error renaming folder:', error)
      alert('Failed to rename folder. Please try again.')
    }
  }

  const handleRenameCancel = () => {
    setRenameFolder(null)
    setNewFolderName("")
  }

  const handleDeleteClick = (folder: FolderItem) => {
    console.log('🔴 Folder delete clicked for:', folder.id)
    setDeleteConfirmation(folder)
    setActiveMenuId(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return

    console.log('🔴 User confirmed folder deletion for:', deleteConfirmation.id)
    
    try {
      console.log('🗑️ Attempting to delete folder:', deleteConfirmation.id)
      
      const response = await fetch(`/api/folders/${deleteConfirmation.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('🔍 Folder delete response status:', response.status)

      if (response.ok) {
        console.log('✅ Folder deleted successfully')
        onFolderDeleted?.(deleteConfirmation.id)
        setDeleteConfirmation(null)
      } else {
        const errorData = await response.json()
        console.error('❌ Folder delete failed:', errorData)
        alert(`Failed to delete folder: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error deleting folder:', error)
      alert('Failed to delete folder. Please try again.')
    }
  }

  const handleCancelDelete = () => {
    console.log('🔴 User cancelled folder deletion')
    setDeleteConfirmation(null)
  }

  const handleUpdateFolderSystemPrompt = async (folderId: string, prompt: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ systemPrompt: prompt }),
      })

      if (response.ok) {
        const updatedFolder = await response.json()
        onFolderUpdated(updatedFolder)
        setEditingPromptId(null)
      } else {
        throw new Error("Failed to update folder")
      }
    } catch (error) {
      console.error("Error updating folder system prompt:", error)
      throw error
    }
  }

  const handleUpdateGlobalSystemPrompt = async (prompt: string) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ globalSystemPrompt: prompt }),
      })

      if (response.ok) {
        const result = await response.json()
        onGlobalSystemPromptUpdated(result.globalSystemPrompt)
        setEditingPromptId(null)
      } else {
        throw new Error("Failed to update global system prompt")
      }
    } catch (error) {
      console.error("Error updating global system prompt:", error)
      throw error
    }
  }

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between px-2 py-1">
        <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-primary" />
          Folders
        </h3>
        <FolderCreate onFolderCreated={onFolderCreated} />
      </div>
      
      {/* All Conversations button */}
      <div className="relative">
        <div className="relative group">
          <Button
            variant={selectedFolderId === null ? "secondary" : "ghost"}
            className={`w-full justify-start gap-3 h-auto p-3 text-left transition-all duration-300 hover:glass-effect border border-transparent hover:border-white/20 group ${
              selectedFolderId === null 
                ? 'glass-effect bg-primary/20 border-primary/30 neon-glow' 
                : 'hover:bg-white/5'
            }`}
            onClick={() => onSelectFolder(null)}
          >
            <MessageSquare className={`h-4 w-4 flex-shrink-0 transition-colors duration-300 ${
              selectedFolderId === null ? 'text-primary' : 'text-white/60 group-hover:text-primary'
            }`} />
            <div className="flex-1 min-w-0 pr-6">
              <div className={`truncate text-sm font-medium transition-colors duration-300 ${
                selectedFolderId === null ? 'text-white' : 'text-white/80 group-hover:text-white'
              }`}>
                All Conversations
              </div>
              <div className={`text-xs transition-colors duration-300 ${
                selectedFolderId === null ? 'text-white/70' : 'text-white/50 group-hover:text-white/60'
              }`}>
                {allConversationsCount} conversations
              </div>
            </div>
          </Button>

          {/* Three-dot menu button */}
          <button
            onClick={(e) => handleMenuClick(e, 'global')}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-70 transition-all duration-300 text-white/60 hover:text-white rounded flex items-center justify-center hover:bg-white/10"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Dropdown menu for global settings */}
        {activeMenuId === 'global' && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setActiveMenuId(null)}
            />
            <div className="absolute right-2 top-full mt-1 bg-slate-900 border border-white/20 rounded-md shadow-lg z-50 min-w-[150px]">
              <button
                className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                onClick={() => handleEditInstructions('global')}
              >
                {globalSystemPrompt ? (
                  <>
                    <Settings className="h-4 w-4 text-primary" />
                    Edit instructions
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Add instructions
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
      
      {folders.length === 0 ? (
        <div className="text-xs text-white/50 px-2 py-2">
          No folders yet. Create one to organize your conversations.
        </div>
      ) : (
        folders.map((folder) => (
          <div key={folder.id} className="relative">
            <div className="relative group">
              <Button
                variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-auto p-3 text-left transition-all duration-300 hover:glass-effect border border-transparent hover:border-white/20 group ${
                  selectedFolderId === folder.id 
                    ? 'glass-effect bg-primary/20 border-primary/30 neon-glow' 
                    : 'hover:bg-white/5'
                }`}
                onClick={() => onSelectFolder(folder.id)}
              >
                <Folder className={`h-4 w-4 flex-shrink-0 transition-colors duration-300 ${
                  selectedFolderId === folder.id ? 'text-primary' : 'text-white/60 group-hover:text-primary'
                }`} />
                <div className="flex-1 min-w-0 pr-6">
                  <div className={`truncate text-sm font-medium transition-colors duration-300 ${
                    selectedFolderId === folder.id ? 'text-white' : 'text-white/80 group-hover:text-white'
                  }`}>
                    {folder.name}
                  </div>
                  <div className={`text-xs transition-colors duration-300 ${
                    selectedFolderId === folder.id ? 'text-white/70' : 'text-white/50 group-hover:text-white/60'
                  }`}>
                    {folder.conversationCount} conversations
                  </div>
                </div>
              </Button>

              {/* Three-dot menu button */}
              <button
                onClick={(e) => handleMenuClick(e, folder.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-70 transition-all duration-300 text-white/60 hover:text-white rounded flex items-center justify-center hover:bg-white/10"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Dropdown menu for folder settings */}
            {activeMenuId === folder.id && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveMenuId(null)
                  }}
                />
                <div className="absolute right-2 top-full mt-1 bg-slate-900 border border-white/20 rounded-md shadow-lg z-50 min-w-[150px]">
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditInstructions(folder.id)
                    }}
                  >
                    {folder.systemPrompt ? (
                      <>
                        <Settings className="h-4 w-4 text-primary" />
                        Edit instructions
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4" />
                        Add instructions
                      </>
                    )}
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRenameClick(folder)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    Rename folder
                  </button>
                  {onFolderDeleted && (
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(folder)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete folder
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))
      )}

      {/* System Prompt Editor Modals */}
      {editingPromptId === 'global' && (
        <SystemPromptEditor
          title="Global Instructions"
          currentPrompt={globalSystemPrompt}
          placeholder="Enter default instructions for all conversations..."
          onSave={handleUpdateGlobalSystemPrompt}
          isGlobal={true}
          compact={false}
          isOpen={editingPromptId === 'global'}
          onClose={() => setEditingPromptId(null)}
        />
      )}

      {editingPromptId && editingPromptId !== 'global' && (
        <SystemPromptEditor
          title={`${folders.find(f => f.id === editingPromptId)?.name} Instructions`}
          currentPrompt={folders.find(f => f.id === editingPromptId)?.systemPrompt}
          placeholder="Enter instructions for conversations in this folder..."
          onSave={(prompt) => handleUpdateFolderSystemPrompt(editingPromptId, prompt)}
          compact={false}
          isOpen={!!editingPromptId && editingPromptId !== 'global'}
          onClose={() => setEditingPromptId(null)}
        />
      )}

      {/* Rename Folder Modal */}
      {renameFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/20 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Edit className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Rename Folder</h3>
                <p className="text-sm text-white/60">Enter a new name for this folder</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Folder Name
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter folder name..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameConfirm()
                  } else if (e.key === 'Escape') {
                    handleRenameCancel()
                  }
                }}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleRenameCancel}
                className="border-white/20 text-white/80 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRenameConfirm}
                disabled={!newFolderName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/20 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Folder</h3>
                <p className="text-sm text-white/60">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6">
              Are you sure you want to delete the folder{" "}
              <span className="font-medium text-white">"{deleteConfirmation.name}"</span>?
              <br />
              <span className="text-sm text-white/60">
                {deleteConfirmation.conversationCount > 0 
                  ? `All ${deleteConfirmation.conversationCount} conversations and documents in this folder will also be permanently deleted.`
                  : 'All documents in this folder will also be permanently deleted.'
                }
              </span>
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="border-white/20 text-white/80 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Folder
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 