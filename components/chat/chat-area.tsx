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
      const response = await fetch(`/api/conversations/${convId}`)
      if (response.ok) {
        const conversation = await response.json()
        const processedMessages = conversation.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role.toLowerCase(),
          model: msg.model,
          latency: msg.latency,
          inputTokens: msg.inputTokens,
          outputTokens: msg.outputTokens,
          cost: msg.cost,
          createdAt: msg.createdAt
        }))
        setMessages(processedMessages)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const saveMessage = async (convId: string, content: string, role: string, model?: string, latency?: number) => {
    try {
      const response = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, role, model, latency }),
      })
      
      if (response.ok) {
        const savedMessage = await response.json()
        return {
          id: savedMessage.id,
          content: savedMessage.content,
          role: savedMessage.role.toLowerCase(),
          model: savedMessage.model,
          latency: savedMessage.latency,
          inputTokens: savedMessage.inputTokens,
          outputTokens: savedMessage.outputTokens,
          cost: savedMessage.cost,
          createdAt: savedMessage.createdAt
        }
      }
    } catch (error) {
      console.error("Error saving message:", error)
    }
    return null
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

          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: conversationHistory,
              model,
              systemPrompt: activeSystemPrompt,
              folderId: selectedFolderId,
              stream: true,
              temperature: localTemperature,
              maxTokens: localMaxTokens,
              tools: tools.length > 0 ? tools : undefined
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to get AI response')
          }

          // Handle streaming response
          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body reader available')
          }

          const decoder = new TextDecoder()
          let accumulatedContent = ""
          let firstChunkReceived = false
          
          try {
            while (true) {
              const { done, value } = await reader.read()
              
              if (done) break
              
              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split('\n')
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim()
                  
                  if (data === '[DONE]') {
                    // Stream completed
                    break
                  }
                  
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.error) {
                      throw new Error(parsed.error)
                    }
                    
                    if (parsed.content) {
                      if (!firstChunkReceived) {
                        // Hide loading indicator when first chunk arrives
                        setIsLoading(false)
                        firstChunkReceived = true
                      }
                      
                      accumulatedContent += parsed.content
                      
                      // Update the message in real-time
                      setMessages(prev => 
                        prev.map(msg => 
                          msg.id === tempAiMessage.id 
                            ? { ...msg, content: accumulatedContent }
                            : msg
                        )
                      )
                    }
                  } catch (parseError) {
                    console.error('Error parsing streaming data:', parseError)
                  }
                }
              }
            }
          } finally {
            reader.releaseLock()
          }

          const responseEndTime = Date.now()
          const responseLatency = responseEndTime - responseStartTime
          
          // Save final AI message to database
          if (accumulatedContent) {
            const savedAiMessage = await saveMessage(currentConversationId!, accumulatedContent, "assistant", model, responseLatency)
            
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
          await saveMessage(currentConversationId!, errorMessage.content, "assistant", model, responseLatency)
          
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

  if (!conversationId && !selectedFolderId) {
    return (
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile hamburger button */}
        {isSidebarCollapsed && onToggleSidebar && (
          <div className="absolute top-4 left-4 z-10 md:hidden">
            <Button
              onClick={onToggleSidebar}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 bg-slate-900/80 border-white/20 hover:bg-slate-800"
            >
              <Menu className="h-4 w-4 text-white" />
            </Button>
          </div>
        )}
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">
              Welcome to Neural Chat
            </h2>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              Experience the future of AI conversation. Start typing to begin your journey into 
              intelligent dialogue powered by advanced neural networks.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                "Ask me anything",
                "Creative writing", 
                "Code assistance",
                "Problem solving"
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
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile hamburger button */}
        {isSidebarCollapsed && onToggleSidebar && (
          <div className="absolute top-4 left-4 z-10 md:hidden">
            <Button
              onClick={onToggleSidebar}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 bg-slate-900/80 border-white/20 hover:bg-slate-800"
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
    <div className="flex-1 flex flex-col relative">
      {/* Mobile hamburger button */}
      {isSidebarCollapsed && onToggleSidebar && (
        <div className="absolute top-4 left-4 z-10 md:hidden">
          <Button
            onClick={onToggleSidebar}
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 bg-slate-900/80 border-white/20 hover:bg-slate-800"
          >
            <Menu className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}
      
      {conversationId && <ChatHeader conversationId={conversationId} refreshTrigger={refreshTrigger} selectedModel={selectedModel} currentContextSize={currentContextSize} />}
      
      <MessageList messages={messages} isLoading={isLoading || isLoadingMessages} />
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