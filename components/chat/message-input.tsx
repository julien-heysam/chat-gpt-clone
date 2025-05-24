"use client"

import { useState, useRef, KeyboardEvent, useEffect } from "react"
import { Send, Plus, Brain, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCurrentModels, getModelById, DEFAULT_MODEL } from "@/lib/models"
import { AISettings } from "./ai-settings"
import { ToolPicker } from "@/components/tools/tool-picker"
import { Tool, getToolIcon } from "@/lib/tools"

interface MessageInputProps {
  onSendMessage: (message: string, model: string, tools?: Tool[]) => void
  selectedModel: string
  onModelChange: (model: string) => void
  onInputChange?: (value: string) => void
  value?: string
  disabled?: boolean
  temperature?: number
  maxTokens?: number
  onTemperatureChange?: (value: number) => void
  onMaxTokensChange?: (value: number) => void
  selectedTools?: Tool[]
  onToolsChange?: (tools: Tool[]) => void
}

export function MessageInput({ 
  onSendMessage, 
  selectedModel, 
  onModelChange, 
  onInputChange, 
  value = "", 
  disabled = false,
  temperature = 0.7,
  maxTokens = 4096,
  onTemperatureChange,
  onMaxTokensChange,
  selectedTools = [],
  onToolsChange
}: MessageInputProps) {
  const [message, setMessage] = useState(value)
  const [isToolPickerOpen, setIsToolPickerOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const models = getCurrentModels()
  const currentModel = getModelById(selectedModel)

  // Sync with external value
  useEffect(() => {
    setMessage(value)
  }, [value])

  const getCapabilityBadge = (capabilities: string[]) => {
    // Show the most relevant capability as a badge
    if (capabilities.includes('extended-thinking')) return 'thinking'
    if (capabilities.includes('reasoning')) return 'reasoning'
    if (capabilities.includes('coding')) return 'coding'
    if (capabilities.includes('vision')) return 'vision'
    return capabilities[0] || ''
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'anthropic':
        return '🤖'
      case 'openai':
        return '⚡'
      default:
        return '🔮'
    }
  }

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), selectedModel, selectedTools)
      setMessage("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleToolSelect = (tool: Tool) => {
    if (!onToolsChange) return
    
    const isSelected = selectedTools.some(selected => selected.id === tool.id)
    if (isSelected) {
      // Remove tool
      onToolsChange(selectedTools.filter(selected => selected.id !== tool.id))
    } else {
      // Add tool
      onToolsChange([...selectedTools, tool])
    }
  }

  const handleRemoveTool = (toolId: string) => {
    if (!onToolsChange) return
    onToolsChange(selectedTools.filter(tool => tool.id !== toolId))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setMessage(newValue)
    onInputChange?.(newValue)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="border-t border-white/10 relative z-20">
      <div className="max-w-4xl mx-auto p-6">
        {/* Controls row */}
        <div className="flex items-center gap-2 mb-3">
          {/* Add button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsToolPickerOpen(!isToolPickerOpen)}
            className={`h-8 w-8 p-0 transition-colors border ${
              selectedTools.length > 0 || isToolPickerOpen
                ? 'text-primary bg-primary/20 border-primary/30 hover:bg-primary/30'
                : 'text-white/60 hover:text-white hover:bg-white/10 border-white/20 hover:border-white/30'
            }`}
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Model selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/30 transition-colors"
              >
                <span className="mr-2">{currentModel ? getProviderIcon(currentModel.provider) : '🤖'}</span>
                <span className="text-sm">{currentModel?.name || 'Select Model'}</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="bg-white/5 border-white/10 backdrop-blur-sm w-80"
            >
              {models.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onModelChange(model.id)}
                  className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{getProviderIcon(model.provider)}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{model.name}</span>
                        <span className="text-xs text-white/50">
                          ${model.costPerTokenInput}/${model.costPerTokenOutput} per 1M tokens
                        </span>
                      </div>
                    </div>
                    {getCapabilityBadge(model.capabilities) && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        {getCapabilityBadge(model.capabilities)}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* AI Settings */}
          {onTemperatureChange && onMaxTokensChange && (
            <AISettings
              temperature={temperature}
              maxTokens={maxTokens}
              selectedModel={selectedModel}
              onTemperatureChange={onTemperatureChange}
              onMaxTokensChange={onMaxTokensChange}
            />
          )}
        </div>

        {/* Selected Tools */}
        {selectedTools.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTools.map((tool) => {
              const Icon = getToolIcon(tool.name)
              return (
                <div
                  key={tool.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-sm"
                >
                  <Icon className="h-3 w-3 text-primary" />
                  <span className="text-primary font-medium">{tool.name}</span>
                  <button
                    onClick={() => handleRemoveTool(tool.id)}
                    className="text-primary/60 hover:text-primary transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                disabled={disabled}
                className="min-h-[52px] max-h-[120px] resize-none pr-12 bg-transparent border-none text-white placeholder:text-white/50 focus:outline-none focus:ring-0 rounded-xl p-4"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || disabled}
                size="sm"
                className={`absolute right-3 bottom-3 h-10 w-10 p-0 rounded-full transition-all transform hover:scale-110 ${
                  message.trim() && !disabled
                    ? 'modern-button text-white shadow-lg'
                    : 'bg-white/10 text-white/50 hover:bg-white/20'
                }`}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Help text */}
        <div className="text-xs text-white/40 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line • Using {currentModel?.name || 'No model selected'}
          {currentModel && (
            <span className="text-white/30"> • Max output: {currentModel.maxOutputTokens.toLocaleString()} tokens</span>
          )}
        </div>
      </div>

      {/* Tool Picker */}
      <ToolPicker
        isOpen={isToolPickerOpen}
        onClose={() => setIsToolPickerOpen(false)}
        onToolSelect={handleToolSelect}
        selectedTools={selectedTools}
      />
    </div>
  )
} 