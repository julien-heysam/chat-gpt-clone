"use client"

import { useState, useEffect, useRef } from "react"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { ChatHeader } from "./chat-header"
import { Sparkles, Folder, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DEFAULT_MODEL, estimateTokenCount, getModelById } from "@/lib/models"
import { ModelSelector } from "./model-selector"
import { DocumentUpload } from "../documents/document-upload"
import { DocumentList } from "../documents/document-list"
import { Tool } from "@/lib/tools"

interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  model?: string
  latency?: number
  inputTokens?: number
  outputTokens?: number
  cost?: number
  createdAt: string
  toolCalls?: Array<{
    id: string
    name: string
    input: any
    output?: string
    status: 'calling' | 'success' | 'error'
    error?: string
  }>
}

interface ChatAreaProps {
  conversationId: string | null
  selectedFolderId?: string | null
  folderName?: string
  systemPrompt?: string | null
  globalSystemPrompt?: string | null
  onCreateConversation: (firstMessage?: string, folderId?: string) => Promise<string | null>
  onUpdateTitle: (conversationId: string, newTitle: string) => void
  temperature?: number
  maxTokens?: number
  isSidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export function ChatArea({ 
  conversationId, 
  selectedFolderId, 
  folderName, 
  systemPrompt,
  globalSystemPrompt,
  onCreateConversation, 
  onUpdateTitle,
  temperature = 0.7,
  maxTokens = 4096,
  isSidebarCollapsed = false,
  onToggleSidebar
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [currentContextSize, setCurrentContextSize] = useState(0)
  const [currentInput, setCurrentInput] = useState("")
  const [documentRefreshTrigger, setDocumentRefreshTrigger] = useState(0)
  const [selectedTools, setSelectedTools] = useState<Tool[]>([])
  
  // New state for local control (optional)
  const [localTemperature, setLocalTemperature] = useState(temperature)
  const [localMaxTokens, setLocalMaxTokens] = useState(maxTokens)

  // Adjust maxTokens when model changes to ensure it doesn't exceed model limits
  useEffect(() => {
    const currentModel = getModelById(selectedModel)
    if (currentModel && localMaxTokens > currentModel.maxOutputTokens) {
      setLocalMaxTokens(currentModel.maxOutputTokens)
    }
  }, [selectedModel, localMaxTokens])

  // Calculate current context size
  const calculateCurrentContext = (inputText: string = "") => {
    // Calculate tokens from conversation history
    const conversationTokens = messages.reduce((total, msg) => {
      return total + estimateTokenCount(msg.content)
    }, 0)
    
    // Add current input tokens
    const inputTokens = estimateTokenCount(inputText)
    
    // Add system prompt tokens if present
    const activeSystemPrompt = systemPrompt || globalSystemPrompt
    const systemTokens = activeSystemPrompt ? estimateTokenCount(activeSystemPrompt) : 0
    
    const totalContext = conversationTokens + inputTokens + systemTokens
    setCurrentContextSize(totalContext)
    return totalContext
  }

  // Update context when messages change
  useEffect(() => {
    calculateCurrentContext(currentInput)
  }, [messages, currentInput, systemPrompt, globalSystemPrompt])

  const handleInputChange = (value: string) => {
    setCurrentInput(value)
    calculateCurrentContext(value)
  }

  const handleDocumentUploadSuccess = () => {
    setDocumentRefreshTrigger(prev => prev + 1)
  }

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId)
    } else {
      setMessages([])
    }
  }, [conversationId])

  const loadMessages = async (convId: string) => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/conversations/${convId}/messages`)
      if (response.ok) {
        const data = await response.json()
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role.toLowerCase(),
          model: msg.model,
          latency: msg.latency,
          inputTokens: msg.inputTokens,
          outputTokens: msg.outputTokens,
          cost: msg.cost,
          createdAt: msg.createdAt,
          toolCalls: msg.toolCalls || undefined
        }))
        setMessages(formattedMessages)
      } else {
        console.error("Failed to load messages")
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const saveMessage = async (convId: string, content: string, role: string, model?: string, latency?: number, toolCalls?: any[]) => {
    try {
      const response = await fetch('/api/conversations/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: convId,
          content,
          role,
          model,
          latency,
          toolCalls
        })
      })

      if (response.ok) {
        const savedMessage = await response.json()
        return savedMessage
      } else {
        console.error('Failed to save message')
        return null
      }
    } catch (error) {
      console.error('Error saving message:', error)
      return null
    }
  }

  const handleSendMessage = async (content: string, model: string = selectedModel, tools: Tool[] = []) => {
    if (!content.trim()) return

    // Clear current input since we're sending the message
    setCurrentInput("")
    
    // Store selected tools for this conversation
    if (tools.length > 0) {
      setSelectedTools(tools)
    }

    let currentConversationId = conversationId

    // Create new conversation if none exists
    if (!currentConversationId) {
      currentConversationId = await onCreateConversation(content, selectedFolderId || undefined)
      if (!currentConversationId) {
        console.error("Failed to create conversation")
        return
      }
    }

    // Add user message immediately for UI responsiveness
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      role: "user",
      model,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, tempUserMessage])
    setIsLoading(true)

    try {
      // Save user message to database
      const savedUserMessage = await saveMessage(currentConversationId, content, "user", model)
      
      if (savedUserMessage) {
        // Replace temp message with saved message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempUserMessage.id ? savedUserMessage : msg
          )
        )

        // Update conversation title if it's the first message
        if (messages.length === 0) {
          const title = content.length > 50 ? content.slice(0, 50) + '...' : content
          onUpdateTitle(currentConversationId, title)
        }

        // Get AI response
        const responseStartTime = Date.now()
        
        try {
          // Prepare conversation history for AI
          const conversationHistory = messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
          
          // Add the current user message
          conversationHistory.push({
            role: "user",
            content
          })

          // Determine system prompt (folder system prompt takes precedence)
          const activeSystemPrompt = systemPrompt || globalSystemPrompt

          // Create temporary AI message for streaming
          const tempAiMessage: Message = {
            id: `temp-ai-${Date.now()}`,
            content: "",
            role: "assistant",
            model,
            latency: 0,
            inputTokens: 0,
            outputTokens: 0,
            cost: 0,
            createdAt: new Date().toISOString()
          }

          setMessages(prev => [...prev, tempAiMessage])

          // Stream AI response
          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: conversationHistory,
              model,
              conversationId: currentConversationId,
              systemPrompt: activeSystemPrompt,
              temperature: temperature,
              maxTokens: maxTokens,
              tools: tools.length > 0 ? tools : selectedTools
            })
          })

          if (!response.ok) {
            throw new Error('Failed to get AI response')
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response stream available')
          }

          let accumulatedContent = ""
          let currentToolCalls: any[] = []

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n').filter(line => line.trim())

            for (const line of lines) {
              try {
                const event = JSON.parse(line)
                
                switch (event.type) {
                  case 'content':
                    accumulatedContent += event.data
                    // Update the temporary message with accumulated content
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === tempAiMessage.id 
                          ? { ...msg, content: accumulatedContent }
                          : msg
                      )
                    )
                    break
                    
                  case 'tool_call_start':
                    const newToolCall = {
                      id: event.data.id,
                      name: event.data.name,
                      input: null,
                      output: null,
                      status: 'calling' as const,
                      error: undefined
                    }
                    currentToolCalls.push(newToolCall)
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === tempAiMessage.id 
                          ? { ...msg, toolCalls: [...currentToolCalls] }
                          : msg
                      )
                    )
                    break
                    
                  case 'tool_call_input':
                    currentToolCalls = currentToolCalls.map(tc =>
                      tc.id === event.data.id ? { ...tc, input: event.data.input } : tc
                    )
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === tempAiMessage.id 
                          ? { ...msg, toolCalls: [...currentToolCalls] }
                          : msg
                      )
                    )
                    break
                    
                  case 'tool_call_success':
                    currentToolCalls = currentToolCalls.map(tc =>
                      tc.id === event.data.id 
                        ? { ...tc, output: event.data.output, status: 'success' as const }
                        : tc
                    )
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === tempAiMessage.id 
                          ? { ...msg, toolCalls: [...currentToolCalls] }
                          : msg
                      )
                    )
                    break
                    
                  case 'tool_call_error':
                    currentToolCalls = currentToolCalls.map(tc =>
                      tc.id === event.data.id 
                        ? { ...tc, error: event.data.error, status: 'error' as const }
                        : tc
                    )
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === tempAiMessage.id 
                          ? { ...msg, toolCalls: [...currentToolCalls] }
                          : msg
                      )
                    )
                    break
                    
                  case 'done':
                    // Streaming complete
                    break
                    
                  case 'error':
                    throw new Error(event.data.message)
                    
                  default:
                    console.warn('Unknown event type:', event.type)
                }
              } catch (e) {
                console.warn('Failed to parse event:', line, e)
              }
            }
          }

          const responseEndTime = Date.now()
          const responseLatency = responseEndTime - responseStartTime
          
          // Save final AI message to database
          if (accumulatedContent) {
            const savedAiMessage = await saveMessage(currentConversationId!, accumulatedContent, "assistant", model, responseLatency, currentToolCalls)
            
            if (savedAiMessage) {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === tempAiMessage.id ? savedAiMessage : msg
                )
              )
              // Refresh conversation stats
              setRefreshTrigger(prev => prev + 1)
            }
          }

          setIsLoading(false)
          
        } catch (error) {
          console.error("Error getting AI response:", error)
          const responseEndTime = Date.now()
          const responseLatency = responseEndTime - responseStartTime
          
          // Show error message to user
          const errorMessage: Message = {
            id: `error-${Date.now()}`,
            content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
            role: "assistant",
            model,
            latency: responseLatency,
            inputTokens: 0,
            outputTokens: 0,
            cost: 0,
            createdAt: new Date().toISOString()
          }

          setMessages(prev => {
            // Remove any temporary AI message and add error message
            const filtered = prev.filter(msg => !msg.id.startsWith('temp-ai-'))
            return [...filtered, errorMessage]
          })
          
          // Save error message to database
          await saveMessage(currentConversationId!, errorMessage.content, "assistant", model, responseLatency, [])
          
          // Refresh conversation stats
          setRefreshTrigger(prev => prev + 1)
          
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id))
      setIsLoading(false)
    }
  }

  const handleMessagesDeleted = (deletedMessageIds: string[]) => {
    // Remove deleted messages from local state
    setMessages(prev => prev.filter(msg => !deletedMessageIds.includes(msg.id)))
    // Refresh conversation stats
    setRefreshTrigger(prev => prev + 1)
  }

  if (!conversationId && !selectedFolderId) {
    return (
      <div className="h-full flex flex-col relative overflow-hidden">
        {/* Mobile hamburger button */}
        {isSidebarCollapsed && onToggleSidebar && (
          <div className="absolute top-4 left-4 z-10 md:hidden">
            <Button
              onClick={onToggleSidebar}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 border-white/30 hover:from-purple-500/90 hover:to-blue-500/90 shadow-lg backdrop-blur-sm"
            >
              <Menu className="h-4 w-4 text-white" />
            </Button>
          </div>
        )}
        
        <div className="flex-1 flex items-center justify-center relative">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-pink-500/10 to-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="text-center max-w-3xl mx-auto p-8 relative z-10">
            {/* Enhanced icon with glass effect */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full glass-effect-strong animate-pulse">
                <div className="w-full h-full rounded-full holographic flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-white animate-pulse" />
                </div>
              </div>
              <div className="absolute -inset-4 rounded-full border border-white/20 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            
            {/* Enhanced title with gradient */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-blue-300 animate-pulse">
              Neural Chat
            </h1>
            <h2 className="text-xl md:text-2xl font-light mb-8 text-white/80">
              Sites beyond imagination, one prompt away.
            </h2>
            
            <p className="text-white/60 text-lg mb-12 leading-relaxed max-w-2xl mx-auto">
              Experience the future of AI conversation. Start typing to begin your journey into 
              intelligent dialogue powered by advanced neural networks.
            </p>
            
            {/* Enhanced suggestion pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                "Ask me anything",
                "Creative writing", 
                "Code assistance",
                "Problem solving"
              ].map((suggestion, i) => (
                <div
                  key={i}
                  className="modern-button px-6 py-3 rounded-full text-sm text-white/90 hover:text-white font-medium cursor-pointer transform hover:scale-105 transition-all duration-300"
                >
                  {suggestion}
                </div>
              ))}
            </div>
            
            {/* Call to action */}
            <div className="glass-effect-strong rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-white/70 text-sm mb-3">Ready to start?</p>
              <div className="text-xs text-white/50">
                Type your message below to begin your AI conversation
              </div>
            </div>
          </div>
        </div>
        <MessageInput 
          onSendMessage={handleSendMessage} 
          selectedModel={selectedModel} 
          onModelChange={setSelectedModel} 
          value={currentInput}
          onInputChange={handleInputChange}
          disabled={isLoading}
          temperature={localTemperature}
          maxTokens={localMaxTokens}
          onTemperatureChange={setLocalTemperature}
          onMaxTokensChange={setLocalMaxTokens}
          selectedTools={selectedTools}
          onToolsChange={setSelectedTools}
        />
      </div>
    )
  }

  if (selectedFolderId && !conversationId) {
    const activePrompt = systemPrompt || globalSystemPrompt

    return (
      <div className="h-full flex flex-col relative overflow-hidden">
        {/* Mobile hamburger button */}
        {isSidebarCollapsed && onToggleSidebar && (
          <div className="absolute top-4 left-4 z-10 md:hidden">
            <Button
              onClick={onToggleSidebar}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 border-white/30 hover:from-purple-500/90 hover:to-blue-500/90 shadow-lg backdrop-blur-sm"
            >
              <Menu className="h-4 w-4 text-white" />
            </Button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Folder className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">
                {folderName || "Folder"}
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Organize your conversations and documents in this folder.
              </p>
              
              {/* Active system prompt indicator */}
              {activePrompt && (
                <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Active Instructions
                    </span>
                  </div>
                  <p className="text-sm text-white/70 text-left">
                    {activePrompt}
                  </p>
                </div>
              )}
            </div>

            {/* Document Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Upload Documents
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <DocumentUpload 
                    folderId={selectedFolderId} 
                    onUploadSuccess={handleDocumentUploadSuccess} 
                  />
                </div>
              </div>

              {/* Document List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  Folder Documents
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <DocumentList 
                    folderId={selectedFolderId} 
                    refreshTrigger={documentRefreshTrigger} 
                  />
                </div>
              </div>
            </div>
            
            {/* Conversation Suggestions */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">Start a New Conversation</h3>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  "Analyze documents",
                  "Research notes", 
                  "Creative ideas",
                  "Technical discussion"
                ].map((suggestion, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 bg-white/5 border border-white/20 rounded-full text-sm text-white/80 hover:border-primary/50 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <MessageInput 
          onSendMessage={handleSendMessage} 
          selectedModel={selectedModel} 
          onModelChange={setSelectedModel} 
          value={currentInput}
          onInputChange={handleInputChange}
          disabled={isLoading}
          temperature={localTemperature}
          maxTokens={localMaxTokens}
          onTemperatureChange={setLocalTemperature}
          onMaxTokensChange={setLocalMaxTokens}
          selectedTools={selectedTools}
          onToolsChange={setSelectedTools}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Mobile hamburger button */}
      {isSidebarCollapsed && onToggleSidebar && (
        <div className="absolute top-4 left-4 z-10 md:hidden">
          <Button
            onClick={onToggleSidebar}
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 border-white/30 hover:from-purple-500/90 hover:to-blue-500/90 shadow-lg backdrop-blur-sm"
          >
            <Menu className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}
      
      {/* Header */}
      {conversationId && <ChatHeader conversationId={conversationId} refreshTrigger={refreshTrigger} selectedModel={selectedModel} currentContextSize={currentContextSize} />}
      
      {/* Messages - takes up remaining space */}
      <div className="flex-1 min-h-0">
        <MessageList 
          messages={messages} 
          isLoading={isLoading || isLoadingMessages} 
          conversationId={conversationId || undefined}
          onMessagesDeleted={handleMessagesDeleted}
        />
      </div>
      
      {/* Input - always at bottom */}
      <div className="flex-shrink-0">
        <MessageInput 
          onSendMessage={handleSendMessage} 
          selectedModel={selectedModel} 
          onModelChange={setSelectedModel} 
          value={currentInput}
          onInputChange={handleInputChange}
          disabled={isLoading}
          temperature={localTemperature}
          maxTokens={localMaxTokens}
          onTemperatureChange={setLocalTemperature}
          onMaxTokensChange={setLocalMaxTokens}
          selectedTools={selectedTools}
          onToolsChange={setSelectedTools}
        />
      </div>
    </div>
  )
} 