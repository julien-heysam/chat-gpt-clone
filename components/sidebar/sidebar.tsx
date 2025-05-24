"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Plus, MessageSquare, Folder, Settings, User, Sparkles, ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { ConversationList } from "./conversation-list"
import { FolderList } from "./folder-list"
import { UserMenu } from "./user-menu"
import { NewConversation } from "./new-conversation"

interface Conversation {
  id: string
  title: string
  updatedAt: string
  folderId?: string | null
  _count: {
    messages: number
  }
}

interface FolderItem {
  id: string
  name: string
  systemPrompt?: string | null
  conversationCount: number
}

interface SidebarProps {
  selectedConversationId: string | null
  selectedFolderId: string | null
  onSelectConversation: (id: string | null) => void
  onSelectFolder: (id: string | null) => void
  conversations: Conversation[]
  onNewChat: (folderId?: string) => Promise<string | null>
  onConversationUpdated: () => void
  onConversationDeleted: (conversationId: string) => void
  isLoading: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ 
  selectedConversationId, 
  selectedFolderId,
  onSelectConversation, 
  onSelectFolder,
  conversations, 
  onNewChat,
  onConversationUpdated,
  onConversationDeleted,
  isLoading,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const { data: session } = useSession()
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [globalSystemPrompt, setGlobalSystemPrompt] = useState<string | null>(null)
  const [isLoadingFolders, setIsLoadingFolders] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  // Load folders and user settings when user session is available
  useEffect(() => {
    if (session?.user) {
      loadFolders()
      loadUserSettings()
    }
  }, [session])

  const loadFolders = async () => {
    setIsLoadingFolders(true)
    try {
      const response = await fetch("/api/folders")
      if (response.ok) {
        const foldersData = await response.json()
        setFolders(foldersData)
      } else {
        console.error("Failed to load folders")
      }
    } catch (error) {
      console.error("Error loading folders:", error)
    } finally {
      setIsLoadingFolders(false)
    }
  }

  const loadUserSettings = async () => {
    try {
      const response = await fetch("/api/user/settings")
      if (response.ok) {
        const settings = await response.json()
        setGlobalSystemPrompt(settings.globalSystemPrompt)
      } else {
        console.error("Failed to load user settings")
      }
    } catch (error) {
      console.error("Error loading user settings:", error)
    }
  }

  const handleFolderCreated = (newFolder: FolderItem) => {
    setFolders(prev => [newFolder, ...prev])
  }

  const handleFolderUpdated = (updatedFolder: FolderItem) => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === updatedFolder.id ? updatedFolder : folder
      )
    )
  }

  const handleFolderDeleted = (folderId: string) => {
    console.log('🗑️ Folder deleted, updating UI:', folderId)
    
    // Remove folder from local state for immediate UI update
    setFolders(prev => prev.filter(folder => folder.id !== folderId))
    
    // If the deleted folder was selected, switch to "All Conversations"
    if (selectedFolderId === folderId) {
      onSelectFolder(null)
    }
    
    // Trigger refresh to sync conversations and folders
    setTimeout(() => {
      loadFolders()
    }, 100)
  }

  const handleGlobalSystemPromptUpdated = (prompt: string | null) => {
    setGlobalSystemPrompt(prompt)
  }

  const handleCreateConversation = async () => {
    setIsCreatingConversation(true)
    try {
      const conversationId = await onNewChat(selectedFolderId || undefined)
      if (conversationId && selectedFolderId) {
        // Update folder conversation count
        setFolders(prev => 
          prev.map(folder => 
            folder.id === selectedFolderId 
              ? { ...folder, conversationCount: folder.conversationCount + 1 }
              : folder
          )
        )
      }
    } finally {
      setIsCreatingConversation(false)
    }
  }

  const handleConversationMoved = (conversationId: string, newFolderId: string | null) => {
    // Find the conversation and its current folder
    const conversation = conversations.find(c => c.id === conversationId)
    const oldFolderId = conversation?.folderId

    // Update folder conversation counts
    setFolders(prev => 
      prev.map(folder => {
        if (folder.id === oldFolderId && oldFolderId) {
          // Decrease count for old folder
          return { ...folder, conversationCount: Math.max(0, folder.conversationCount - 1) }
        } else if (folder.id === newFolderId && newFolderId) {
          // Increase count for new folder
          return { ...folder, conversationCount: folder.conversationCount + 1 }
        }
        return folder
      })
    )

    // Trigger conversation list refresh
    onConversationUpdated()
  }



  // Filter conversations based on selected folder
  const filteredConversations = selectedFolderId 
    ? conversations.filter(conv => conv.folderId === selectedFolderId)
    : conversations.filter(conv => !conv.folderId) // Show unfoldered conversations when no folder selected

  // Count conversations not in any folder
  const allConversationsCount = conversations.filter(conv => !conv.folderId).length

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-64'} 
      sidebar-gradient glass-effect border-r border-white/10 flex flex-col h-full relative overflow-hidden transition-all duration-300 ease-in-out
    `}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle floating-animation"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      {/* Toggle Button */}
      <div className="absolute top-4 -right-3 z-20">
        <Button
          onClick={onToggleCollapse}
          variant="outline"
          size="sm"
          className="h-6 w-6 p-0 rounded-full bg-slate-900 border-white/20 hover:bg-slate-800 shadow-lg"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-white" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-white" />
          )}
        </Button>
      </div>

      {isCollapsed ? (
        /* Collapsed Sidebar */
        <div className="flex flex-col items-center py-4 gap-4 relative z-10">
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 hover:bg-white/10"
            title="Expand Sidebar"
          >
            <Menu className="h-5 w-5 text-primary" />
          </Button>
          
          <Button
            onClick={() => handleCreateConversation()}
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 border-primary/30 hover:bg-primary/20"
            title="New Conversation"
            disabled={isCreatingConversation}
          >
            <Plus className="h-4 w-4 text-primary" />
          </Button>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => onSelectFolder(null)}
              variant={selectedFolderId === null ? "secondary" : "ghost"}
              size="sm"
              className="h-10 w-10 p-0"
              title="All Conversations"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            
            {folders.slice(0, 3).map((folder) => (
              <Button
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
                size="sm"
                className="h-10 w-10 p-0"
                title={folder.name}
              >
                <Folder className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <div className="mt-auto">
            {session?.user && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-white/10"
                title={session.user.name || session.user.email || "User"}
              >
                <User className="h-4 w-4 text-white/70" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Expanded Sidebar */
        <>
          {/* Header */}
          <div className="p-4 border-b border-white/10 relative z-10">
            <div className="mb-3">
              <h1 className="text-lg font-bold gradient-text flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Neural Chat
              </h1>
            </div>
            <NewConversation 
              onCreateConversation={handleCreateConversation}
              isLoading={isCreatingConversation}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto relative z-10">
            <div className="p-2">
              <FolderList 
                folders={folders}
                selectedFolderId={selectedFolderId}
                onSelectFolder={onSelectFolder}
                onFolderCreated={handleFolderCreated}
                onFolderUpdated={handleFolderUpdated}
                onFolderDeleted={handleFolderDeleted}
                allConversationsCount={allConversationsCount}
                globalSystemPrompt={globalSystemPrompt}
                onGlobalSystemPromptUpdated={handleGlobalSystemPromptUpdated}
              />
              <ConversationList 
                conversations={filteredConversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={onSelectConversation}
                folders={folders}
                onConversationMoved={handleConversationMoved}
                onConversationDeleted={onConversationDeleted}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 relative z-10">
            <UserMenu user={session?.user} />
          </div>
        </>
      )}
    </div>
  )
} 