"use client"

import { useState } from "react"
import { Settings, Brain, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getModelById, type ModelInfo } from "@/lib/models"

interface AISettingsProps {
  temperature: number
  maxTokens: number
  selectedModel: string
  onTemperatureChange: (value: number) => void
  onMaxTokensChange: (value: number) => void
  enableThinking?: boolean
  onEnableThinkingChange?: (value: boolean) => void
}

export function AISettings({
  temperature,
  maxTokens,
  selectedModel,
  onTemperatureChange,
  onMaxTokensChange,
  enableThinking = false,
  onEnableThinkingChange
}: AISettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Get current model info for limits
  const currentModel = getModelById(selectedModel)
  const modelMaxTokens = currentModel?.maxOutputTokens || 8192
  
  // Check if current model supports thinking
  const supportsThinking = currentModel?.capabilities.includes('extended-thinking') || false
  
  // Ensure current maxTokens doesn't exceed model limit
  const safeMaxTokens = Math.min(maxTokens, modelMaxTokens)

  const handleMaxTokensChange = (value: number) => {
    // Clamp value to model's maximum
    const clampedValue = Math.min(Math.max(value, 100), modelMaxTokens)
    onMaxTokensChange(clampedValue)
  }

  const getResponseLengthDescription = (tokens: number, modelMax: number) => {
    const percentage = (tokens / modelMax) * 100
    if (percentage <= 25) return "Very brief responses"
    if (percentage <= 50) return "Short to medium responses"
    if (percentage <= 75) return "Medium to long responses"
    return "Maximum length responses"
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
          title="AI Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-gray-900 border-white/20" side="top">
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium text-white flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Behavior Settings
            </h3>
            <p className="text-xs text-white/60">
              Customize how the AI responds to your messages
            </p>
          </div>

          {/* Model Info */}
          {currentModel && (
            <div className="p-2 bg-white/5 rounded border border-white/10">
              <p className="text-xs text-white/80">
                <span className="font-medium">{currentModel.name}</span> • Max Output: {modelMaxTokens.toLocaleString()} tokens
              </p>
            </div>
          )}

          {/* Thinking Mode */}
          {supportsThinking && onEnableThinkingChange && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80 flex items-center gap-2">
                  <Brain className="h-3 w-3" />
                  Show Thinking Process
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-6 w-11 p-0 border-white/20 transition-colors ${
                    enableThinking 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                  onClick={() => onEnableThinkingChange(!enableThinking)}
                >
                  <div className={`h-4 w-4 rounded-full bg-current transition-transform ${
                    enableThinking ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </Button>
              </div>
              <p className="text-xs text-white/60">
                {enableThinking 
                  ? "The AI will show its reasoning process as it thinks through your request" 
                  : "The AI will only show its final response"}
              </p>
            </div>
          )}

          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/80 flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Creativity
              </label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => onTemperatureChange(parseFloat(e.target.value) || 0)}
                className="w-20 h-8 text-xs bg-white/5 border-white/20 text-white"
              />
            </div>
            <div className="flex justify-between text-xs text-white/50 mb-2">
              <span>Focused</span>
              <span>Creative</span>
            </div>
            <p className="text-xs text-white/60">
              {temperature <= 0.3 ? "Very focused and consistent" :
               temperature <= 0.7 ? "Balanced creativity and focus" :
               "Highly creative and varied"}
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/80">Response Length</label>
              <Input
                type="number"
                min="100"
                max={modelMaxTokens}
                step="128"
                value={safeMaxTokens}
                onChange={(e) => handleMaxTokensChange(parseInt(e.target.value) || 1024)}
                className="w-24 h-8 text-xs bg-white/5 border-white/20 text-white"
              />
            </div>
            <div className="flex justify-between text-xs text-white/50 mb-2">
              <span>100</span>
              <span>{modelMaxTokens.toLocaleString()}</span>
            </div>
            <p className="text-xs text-white/60">
              {getResponseLengthDescription(safeMaxTokens, modelMaxTokens)}
            </p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-sm text-white/80">Quick Presets</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  onTemperatureChange(0.1)
                  onMaxTokensChange(Math.min(1024, modelMaxTokens))
                }}
              >
                Precise
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  onTemperatureChange(0.7)
                  onMaxTokensChange(Math.min(4096, modelMaxTokens))
                }}
              >
                Balanced
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  onTemperatureChange(0.9)
                  onMaxTokensChange(Math.min(2048, modelMaxTokens))
                }}
              >
                Creative
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white/5 border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  onTemperatureChange(0.3)
                  onMaxTokensChange(modelMaxTokens) // Use full model capacity for detailed
                }}
              >
                Max Length
              </Button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 