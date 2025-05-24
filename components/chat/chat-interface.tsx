"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar/sidebar"
import { ChatArea } from "@/components/chat/chat-area"

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

export function ChatInterface() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [globalSystemPrompt, setGlobalSystemPrompt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true)
      }
    }

    // Check on mount
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isSidebarCollapsed])

  // Load conversations and folders on mount
  useEffect(() => {
    loadConversations()
    loadFolders()
    loadUserSettings()
  }, [])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/folders')
      if (response.ok) {
        const data = await response.json()
        setFolders(data)
      }
    } catch (error) {
      console.error('Error loading folders:', error)
    }
  }

  const loadUserSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        setGlobalSystemPrompt(data.globalSystemPrompt)
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
    }
  }

  const createNewConversation = async (firstMessage?: string, folderId?: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: firstMessage ? firstMessage.slice(0, 50) + '...' : 'New Conversation',
          ...(folderId && { folderId })
        }),
      })

      if (response.ok) {
        const newConversation = await response.json()
        setConversations(prev => [newConversation, ...prev])
        setSelectedConversationId(newConversation.id)
        return newConversation.id
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
    return null
  }

  const handleNewChat = async (folderId?: string): Promise<string | null> => {
    // Create a new conversation if folderId is provided, otherwise just clear selection
    if (folderId) {
      return await createNewConversation(undefined, folderId)
    } else {
      // If we have a selected folder, create conversation in that folder
      if (selectedFolderId) {
        return await createNewConversation(undefined, selectedFolderId)
      } else {
        setSelectedConversationId(null)
        return null
      }
    }
  }

  const handleSelectFolder = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSelectedConversationId(null) // Clear conversation selection when switching folders
  }

  const handleConversationUpdated = () => {
    // Reload conversations to reflect any changes (moves, deletes, etc.)
    loadConversations()
    loadFolders() // Also reload folders to update counts
  }

  const handleConversationDeleted = (conversationId: string) => {
    // Find the conversation being deleted to update folder counts
    const deletedConversation = conversations.find(conv => conv.id === conversationId)
    
    // Immediately remove the conversation from local state for instant UI update
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    
    // Update folder counts immediately if the conversation was in a folder
    if (deletedConversation?.folderId) {
      setFolders(prev => 
        prev.map(folder => 
          folder.id === deletedConversation.folderId 
            ? { ...folder, conversationCount: Math.max(0, folder.conversationCount - 1) }
            : folder
        )
      )
    }
    
    // Clear selection if the deleted conversation was selected
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null)
    }
    
    // Trigger a full refresh to ensure everything is in sync
    setTimeout(() => {
      loadConversations()
      loadFolders()
    }, 100) // Small delay to ensure the deletion has propagated
  }

  const updateConversationTitle = (conversationId: string, newTitle: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, title: newTitle, updatedAt: new Date().toISOString() }
          : conv
      )
    )
  }

  // Get the selected folder name
  const selectedFolder = selectedFolderId ? folders.find(f => f.id === selectedFolderId) : null

  return (
    <div className="flex h-screen bg-background relative">
      {/* Mobile overlay when sidebar is expanded */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
      
      <div className={`
        ${isSidebarCollapsed ? 'relative' : 'relative md:relative fixed z-40'}
        transition-all duration-300 ease-in-out
      `}>
        <Sidebar 
          selectedConversationId={selectedConversationId}
          selectedFolderId={selectedFolderId}
          onSelectConversation={setSelectedConversationId}
          onSelectFolder={handleSelectFolder}
          conversations={conversations}
          onNewChat={handleNewChat}
          onConversationUpdated={handleConversationUpdated}
          onConversationDeleted={handleConversationDeleted}
          isLoading={isLoading}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>
      
      <div className="flex-1 chat-area-gradient h-full">
        <ChatArea 
          conversationId={selectedConversationId} 
          selectedFolderId={selectedFolderId}
          folderName={selectedFolder?.name}
          systemPrompt={selectedFolder?.systemPrompt}
          globalSystemPrompt={globalSystemPrompt}
          onCreateConversation={createNewConversation}
          onUpdateTitle={updateConversationTitle}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>
    </div>
  )
} 