"use client"

import { useState } from "react"
import { Brain, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThinkingDisplayProps {
  content: string
  isStreaming?: boolean
}

export function ThinkingDisplay({ content, isStreaming = false }: ThinkingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content && !isStreaming) return null

  return (
    <div className="mb-4 border border-purple-500/30 rounded-lg bg-gradient-to-r from-purple-500/5 to-indigo-500/5 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-purple-500/10 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className={`h-5 w-5 text-purple-400 ${isStreaming ? 'animate-pulse' : ''}`} />
            {isStreaming && (
              <div className="absolute -inset-1 rounded-full bg-purple-400/20 animate-ping" />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-purple-300 flex items-center gap-2">
              Thinking Process
              {isStreaming && (
                <span className="text-xs text-purple-400/80 animate-pulse">
                  ● Reasoning...
                </span>
              )}
            </h3>
            <p className="text-xs text-purple-400/60">
              {isExpanded ? 'Click to collapse' : 'Click to expand'} the AI's internal reasoning
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {content && (
            <span className="text-xs text-purple-400/60 px-2 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
              {content.length} chars
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-purple-400 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 text-purple-400 transition-transform duration-200" />
          )}
        </div>
      </Button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
          <div className="p-4">
            {content ? (
              <div className="relative">
                {/* Thinking content */}
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-purple-100/90 leading-relaxed font-mono bg-purple-900/20 p-4 rounded-lg border border-purple-500/20 overflow-x-auto">
                    {content}
                  </pre>
                </div>
                
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/5 to-indigo-500/5 pointer-events-none" />
              </div>
            ) : isStreaming ? (
              <div className="flex items-center gap-3 p-4 text-purple-300/80">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
                <span className="text-sm animate-pulse">Processing thoughts...</span>
              </div>
            ) : (
              <div className="text-sm text-purple-300/60 italic p-4">
                No thinking content available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 