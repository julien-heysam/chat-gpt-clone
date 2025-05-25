"use client"

import { useState, useEffect } from "react"
import { Settings, Cpu, DollarSign, Zap, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCost, getModelById } from "@/lib/models"

interface ChatHeaderProps {
  conversationId: string
  refreshTrigger?: number
  selectedModel?: string
  currentContextSize?: number
}

interface ConversationStats {
  totalCost: number
  totalTokens: number
}

export function ChatHeader({ conversationId, refreshTrigger = 0, selectedModel, currentContextSize = 0 }: ChatHeaderProps) {
  const [stats, setStats] = useState<ConversationStats | null>(null)

  useEffect(() => {
    if (conversationId) {
      fetchConversationStats(conversationId)
    }
  }, [conversationId, refreshTrigger])

  const fetchConversationStats = async (convId: string) => {
    try {
      const response = await fetch(`/api/conversations/${convId}`)
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalCost: data.totalCost || 0,
          totalTokens: data.totalTokens || 0
        })
      }
    } catch (error) {
      console.error("Error fetching conversation stats:", error)
    }
  }

  const currentModel = selectedModel ? getModelById(selectedModel) : null
  
  // Calculate context usage percentage for color coding
  const getContextColor = () => {
    if (!currentModel || currentContextSize === 0) return 'text-white/60'
    
    const usagePercent = (currentContextSize / currentModel.maxContextWindow) * 100
    
    if (usagePercent > 90) return 'text-red-400'
    if (usagePercent > 75) return 'text-yellow-400' 
    if (usagePercent > 50) return 'text-orange-400'
    return 'text-green-400'
  }

  return (
    <div className="border-b border-white/10 -ml-px border-l border-l-white/10">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          </div>
          
          <div className="flex items-center gap-4">
            {/* Conversation Stats */}
            <div className="flex items-center gap-3 text-xs text-white/60">
              {stats && stats.totalCost > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full border border-white/20">
                  <DollarSign className="h-3 w-3" />
                  <span>{formatCost(stats.totalCost)}</span>
                </div>
              )}
              {stats && stats.totalTokens > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full border border-white/20">
                  <Zap className="h-3 w-3" />
                  <span>{stats.totalTokens.toLocaleString()} tokens</span>
                </div>
              )}
              {currentModel && (
                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-full border border-white/20">
                  <Brain className="h-3 w-3" />
                  <span className={getContextColor()}>
                    {currentContextSize > 0 ? (
                      <>
                        {(currentContextSize / 1000).toFixed(1)}K/{(currentModel.maxContextWindow / 1000).toFixed(0)}K
                        <span className="text-xs ml-1 opacity-75">
                          ({Math.round((currentContextSize / currentModel.maxContextWindow) * 100)}%)
                        </span>
                      </>
                    ) : (
                      `${(currentModel.maxContextWindow / 1000).toFixed(0)}K ctx`
                    )}
                  </span>
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/30 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 