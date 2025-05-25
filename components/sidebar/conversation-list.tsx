"use client"

import { useState } from "react"
import { MessageSquare, MoreHorizontal, Zap, FolderInput, Trash2, Edit, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MoveConversation } from "./move-conversation"

interface Conversation {
  id: string
  title: string
  updatedAt: string
  folderId?: string | null
  _count?: {
    messages: number
  }
}

interface FolderItem {
  id: string
  name: string
  conversationCount: number
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId: string | null
  onSelectConversation: (id: string | null) => void
  folders: FolderItem[]
  onConversationMoved: (conversationId: string, folderId: string | null) => void
  onConversationDeleted?: (conversationId: string) => void
  onConversationRenamed?: (conversationId: string, newTitle: string) => void
  isLoading?: boolean
}

export function ConversationList({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation,
  folders,
  onConversationMoved,
  onConversationDeleted,
  onConversationRenamed,
  isLoading = false
}: ConversationListProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [moveConversation, setMoveConversation] = useState<Conversation | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<Conversation | null>(null)
  const [renameConversation, setRenameConversation] = useState<Conversation | null>(null)
  const [newTitle, setNewTitle] = useState("")

  const handleMenuClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    console.log('🔵 Menu clicked for conversation:', conversationId)
    console.log('🔵 onConversationDeleted prop exists:', !!onConversationDeleted)
    setActiveMenu(activeMenu === conversationId ? null : conversationId)
  }

  const handleMoveClick = (conversation: Conversation) => {
    setMoveConversation(conversation)
    setActiveMenu(null)
  }

  const handleRenameClick = (conversation: Conversation) => {
    setRenameConversation(conversation)
    setNewTitle(conversation.title)
    setActiveMenu(null)
  }

  const handleGenerateTitleClick = async (conversation: Conversation) => {
    setActiveMenu(null)
    
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/generate-title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        onConversationRenamed?.(conversation.id, data.title)
      } else {
        const errorData = await response.json()
        alert(`Failed to generate title: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error generating title:', error)
      alert('Failed to generate title. Please try again.')
    }
  }

  const handleDeleteClick = (conversation: Conversation) => {
    console.log('🔴 handleDeleteClick called for:', conversation.id)
    console.log('🔴 Opening delete confirmation modal')
    setDeleteConfirmation(conversation)
    setActiveMenu(null)
  }

  const handleRenameConfirm = async () => {
    if (!renameConversation || !newTitle.trim()) return
    
    try {
      const response = await fetch(`/api/conversations/${renameConversation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      })

      if (response.ok) {
        onConversationRenamed?.(renameConversation.id, newTitle.trim())
        setRenameConversation(null)
        setNewTitle("")
      } else {
        const errorData = await response.json()
        alert(`Failed to rename conversation: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error renaming conversation:', error)
      alert('Failed to rename conversation. Please try again.')
    }
  }

  const handleRenameCancel = () => {
    setRenameConversation(null)
    setNewTitle("")
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return
    
    console.log('🔴 User confirmed deletion for:', deleteConfirmation.id)
    
    try {
      console.log('🗑️ Attempting to delete conversation:', deleteConfirmation.id)
      console.log('🗑️ Fetch URL:', `/api/conversations/${deleteConfirmation.id}`)
      
      const response = await fetch(`/api/conversations/${deleteConfirmation.id}`, {
        method: 'DELETE',
        credentials: 'include', // Ensure cookies are included
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('🔍 Delete response status:', response.status)
      console.log('🔍 Delete response ok:', response.ok)
      
      if (response.ok) {
        console.log('✅ Conversation deleted successfully')
        console.log('✅ Calling onConversationDeleted with:', deleteConfirmation.id)
        // Notify parent component about the deletion
        onConversationDeleted?.(deleteConfirmation.id)
        setDeleteConfirmation(null)
      } else {
        const errorData = await response.json()
        console.error('❌ Delete failed:', errorData)
        alert(`Failed to delete conversation: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error)
      alert('Failed to delete conversation. Please try again.')
    }
  }

  const handleCancelDelete = () => {
    console.log('🔴 User cancelled deletion')
    setDeleteConfirmation(null)
  }

  const handleMoveSuccess = (conversationId: string, folderId: string | null) => {
    onConversationMoved(conversationId, folderId)
    setMoveConversation(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-white/70 px-2 py-1 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Recent Conversations
        </h3>
        <div className="text-sm text-white/50 px-2 py-4 text-center">
          <div className="typing-animation">Loading conversations...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-white/70 px-2 py-1 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Recent Conversations
        </h3>
        {conversations.length === 0 ? (
          <div className="text-sm text-white/50 px-2 py-4 text-center glass-effect rounded-lg mx-2 border border-white/10">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-white/30" />
            <p>No conversations yet</p>
            <p className="text-xs mt-1">Start chatting to see your history</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div key={conversation.id} className="relative">
              <div className="relative group">
                <Button
                  variant={selectedConversationId === conversation.id ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-auto p-3 text-left transition-all duration-300 hover:glass-effect border border-transparent hover:border-white/20 group ${
                    selectedConversationId === conversation.id 
                      ? 'glass-effect bg-primary/20 border-primary/30 neon-glow' 
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <MessageSquare className={`h-4 w-4 flex-shrink-0 transition-colors duration-300 ${
                    selectedConversationId === conversation.id ? 'text-primary' : 'text-white/60 group-hover:text-white/80'
                  }`} />
                  <div className="flex-1 min-w-0 pr-6">
                    <div className={`truncate text-sm font-medium transition-colors duration-300 ${
                      selectedConversationId === conversation.id ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`}>
                      {conversation.title}
                    </div>
                    {conversation._count && (
                      <div className="text-xs text-white/50 group-hover:text-white/60 transition-colors duration-300">
                        {conversation._count.messages} messages
                      </div>
                    )}
                  </div>
                </Button>
                
                {/* Separate menu button positioned absolutely */}
                <button
                  onClick={(e) => handleMenuClick(e, conversation.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-70 transition-all duration-300 text-white/60 hover:text-white rounded flex items-center justify-center hover:bg-white/10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Context Menu */}
              {activeMenu === conversation.id && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setActiveMenu(null)}
                  />
                  <div className="absolute right-2 top-full mt-1 bg-slate-900 border border-white/20 rounded-md shadow-lg z-50 min-w-[150px]">
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                      onClick={() => handleMoveClick(conversation)}
                    >
                      <FolderInput className="h-4 w-4" />
                      Move to folder
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                      onClick={() => handleRenameClick(conversation)}
                    >
                      <Edit className="h-4 w-4" />
                      Rename
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                      onClick={() => handleGenerateTitleClick(conversation)}
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate title
                    </button>
                    {onConversationDeleted && (
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        onClick={() => {
                          console.log('🔴 Delete button clicked for:', conversation.id)
                          handleDeleteClick(conversation)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                    {/* Debug: Show if delete button should be visible */}
                    {!onConversationDeleted && (
                      <div className="px-3 py-2 text-xs text-yellow-400">
                        [DEBUG: onConversationDeleted not provided]
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Move Conversation Modal */}
      {moveConversation && (
        <MoveConversation
          conversation={moveConversation}
          folders={folders}
          onMoveSuccess={handleMoveSuccess}
          onClose={() => setMoveConversation(null)}
        />
      )}

      {/* Rename Conversation Modal */}
      {renameConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/20 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Edit className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Rename Conversation</h3>
                <p className="text-sm text-white/60">Enter a new title for this conversation</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Conversation Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter conversation title..."
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
                disabled={!newTitle.trim()}
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
                <h3 className="text-lg font-semibold text-white">Delete Conversation</h3>
                <p className="text-sm text-white/60">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">"{deleteConfirmation.title}"</span>?
              <br />
              <span className="text-sm text-white/60">
                All messages in this conversation will be permanently deleted.
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
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 