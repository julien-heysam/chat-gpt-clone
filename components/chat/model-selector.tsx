"use client"

import { useState } from "react"
import { ModelInfo, getCurrentModels, getModelById } from "@/lib/models"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, Brain, Zap, DollarSign } from "lucide-react"

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const models = getCurrentModels()
  const currentModel = getModelById(selectedModel)

  const formatCost = (inputCost: number, outputCost: number) => {
    if (inputCost < 1 && outputCost < 10) {
      return `$${inputCost}/$${outputCost}`
    }
    return `$${inputCost}/$${outputCost}`
  }

  const getPerformanceBadge = (model: ModelInfo) => {
    if (model.name.includes('Opus') || (model.name.includes('4.1') && !model.name.includes('Mini') && !model.name.includes('Nano'))) {
      return <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded dark:bg-red-900 dark:text-red-200">Premium</span>
    }
    if (model.name.includes('Nano') || model.name.includes('Haiku')) {
      return <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900 dark:text-green-200">Fast</span>
    }
    return <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-900 dark:text-blue-200">Balanced</span>
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

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-64 justify-between">
            {currentModel ? (
              <div className="flex items-center gap-2">
                <span>{getProviderIcon(currentModel.provider)}</span>
                <span className="truncate">{currentModel.name}</span>
                {getPerformanceBadge(currentModel)}
              </div>
            ) : (
              "Select a model"
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80">
          {models.map((model) => (
            <DropdownMenuItem 
              key={model.id} 
              onClick={() => onModelChange(model.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span>{getProviderIcon(model.provider)}</span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.name}</span>
                      {getPerformanceBadge(model)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatCost(model.costPerTokenInput, model.costPerTokenOutput)} per 1M tokens
                    </span>
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {currentModel && (
        <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
          <Brain className="h-3 w-3" />
          <span className="text-xs text-muted-foreground">
            {(currentModel.maxContextWindow / 1000).toFixed(0)}K ctx
          </span>
        </div>
      )}
    </div>
  )
} 