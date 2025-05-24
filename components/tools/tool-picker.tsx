"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, Filter, Zap, Cog } from "lucide-react"
import { Tool, getToolIcon } from "@/lib/tools"

interface ToolPickerProps {
  isOpen: boolean
  onClose: () => void
  onToolSelect: (tool: Tool) => void
  selectedTools: Tool[]
}

export function ToolPicker({ isOpen, onClose, onToolSelect, selectedTools }: ToolPickerProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'BUILTIN' | 'MCP'>('ALL')

  useEffect(() => {
    if (isOpen) {
      loadTools()
    }
  }, [isOpen])

  const loadTools = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tools')
      if (response.ok) {
        const data = await response.json()
        setTools(data)
      } else {
        console.error('Failed to load tools')
      }
    } catch (error) {
      console.error('Error loading tools:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isToolSelected = (tool: Tool) => {
    return selectedTools.some(selected => selected.id === tool.id)
  }

  const handleToolClick = (tool: Tool) => {
    onToolSelect(tool)
  }

  const filteredTools = tools.filter(tool => {
    if (filter === 'ALL') return tool.enabled
    if (filter === 'BUILTIN') return tool.enabled && tool.toolType === 'BUILTIN'
    if (filter === 'MCP') return tool.enabled && tool.toolType === 'MCP'
    return true
  })

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Tool Picker Panel */}
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-auto md:bottom-24 md:w-96 bg-slate-900 border border-white/20 rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Select Tools
            </h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Filter buttons */}
          <div className="flex gap-1">
            <Button
              onClick={() => setFilter('ALL')}
              variant={filter === 'ALL' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              All
            </Button>
            <Button
              onClick={() => setFilter('BUILTIN')}
              variant={filter === 'BUILTIN' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Built-in
            </Button>
            <Button
              onClick={() => setFilter('MCP')}
              variant={filter === 'MCP' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
            >
              <Cog className="h-3 w-3 mr-1" />
              MCP
            </Button>
          </div>
        </div>

        <div className="p-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-white/60">Loading tools...</div>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              {filter === 'ALL' ? 'No enabled tools available' : `No enabled ${filter.toLowerCase()} tools available`}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTools.map((tool) => {
                const Icon = getToolIcon(tool.name, tool.toolType)
                const selected = isToolSelected(tool)
                
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className={`
                      w-full p-3 rounded-lg text-left transition-all duration-200 hover:bg-white/10 border border-transparent
                      ${selected 
                        ? 'bg-primary/20 border-primary/30 ring-1 ring-primary/50' 
                        : 'hover:border-white/20'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                        ${selected ? 'bg-primary/30' : 'bg-white/10'}
                      `}>
                        <Icon className={`h-4 w-4 ${selected ? 'text-primary' : 'text-white/60'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`font-medium text-sm ${selected ? 'text-primary' : 'text-white'}`}>
                            {tool.name}
                          </div>
                          {tool.toolType === 'MCP' && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                              MCP
                            </span>
                          )}
                        </div>
                        {tool.description && (
                          <div className="text-xs text-white/60 line-clamp-2">
                            {tool.description}
                          </div>
                        )}
                      </div>
                      {selected && (
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {selectedTools.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="text-xs text-white/60 mb-2">
              {selectedTools.length} tool{selectedTools.length === 1 ? '' : 's'} selected
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTools.map((tool) => {
                const Icon = getToolIcon(tool.name)
                return (
                  <div
                    key={tool.id}
                    className="flex items-center gap-2 px-2 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs"
                  >
                    <Icon className="h-3 w-3 text-primary" />
                    <span className="text-primary">{tool.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
} 