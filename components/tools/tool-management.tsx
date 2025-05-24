"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Settings,
  ToggleLeft,
  ToggleRight,
  Link,
  Zap,
  Globe,
  BookOpen
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tool, getToolIcon } from "@/lib/tools"

export function ToolManagement() {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newTool, setNewTool] = useState({ 
    name: '', 
    description: '',
    toolType: 'BUILTIN' as 'BUILTIN' | 'MCP',
    mcpConnectionUrl: '',
    mcpAuthType: 'NONE' as 'NONE' | 'API_KEY' | 'BEARER_TOKEN' | 'BASIC_AUTH',
    mcpAuthToken: '',
    mcpTimeout: 30000
  })

  useEffect(() => {
    loadTools()
  }, [])

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

  const handleCreateTool = async () => {
    if (!newTool.name.trim()) return
    
    // Validate MCP fields if it's an MCP tool
    if (newTool.toolType === 'MCP') {
      if (!newTool.mcpConnectionUrl.trim()) {
        alert('MCP Connection URL is required for MCP tools')
        return
      }
      if (newTool.mcpAuthType !== 'NONE' && !newTool.mcpAuthToken.trim()) {
        alert('Authentication token is required for the selected auth type')
        return
      }
    }

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTool.name.trim(),
          description: newTool.description.trim() || null,
          toolType: newTool.toolType,
          ...(newTool.toolType === 'MCP' && {
            mcpConnectionUrl: newTool.mcpConnectionUrl.trim(),
            mcpAuthType: newTool.mcpAuthType,
            mcpAuthToken: newTool.mcpAuthType !== 'NONE' ? newTool.mcpAuthToken.trim() : null,
            mcpTimeout: newTool.mcpTimeout
          })
        })
      })

      if (response.ok) {
        const createdTool = await response.json()
        setTools(prev => [createdTool, ...prev])
        setNewTool({ 
          name: '', 
          description: '',
          toolType: 'BUILTIN',
          mcpConnectionUrl: '',
          mcpAuthType: 'NONE',
          mcpAuthToken: '',
          mcpTimeout: 30000
        })
        setIsCreating(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to create tool: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating tool:', error)
      alert('Failed to create tool. Please try again.')
    }
  }

  const handleUpdateTool = async (tool: Tool) => {
    try {
      const response = await fetch(`/api/tools/${tool.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tool.name.trim(),
          description: tool.description?.trim() || null,
          enabled: tool.enabled
        })
      })

      if (response.ok) {
        const updatedTool = await response.json()
        setTools(prev => prev.map(t => t.id === tool.id ? updatedTool : t))
        setEditingTool(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to update tool: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating tool:', error)
      alert('Failed to update tool. Please try again.')
    }
  }

  const handleDeleteTool = async (toolId: string) => {
    if (!confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTools(prev => prev.filter(tool => tool.id !== toolId))
      } else {
        const errorData = await response.json()
        alert(`Failed to delete tool: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting tool:', error)
      alert('Failed to delete tool. Please try again.')
    }
  }

  const handleToggleEnabled = async (tool: Tool) => {
    const updatedTool = { ...tool, enabled: !tool.enabled }
    await handleUpdateTool(updatedTool)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tool Management</h1>
            <p className="text-white/70">
              Manage AI tools available for conversations. Create built-in tools or connect external tools via MCP (Model Context Protocol).
            </p>
          </div>
          <div>
            <a 
              href="/tools/docs" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              MCP Documentation
            </a>
          </div>
        </div>
      </div>

      {/* Create New Tool */}
      <div className="mb-8 bg-white/5 border border-white/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Create New Tool</h2>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            {isCreating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {isCreating && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tool Name *
                </label>
                <Input
                  value={newTool.name}
                  onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Web Search, Calculator, Custom API"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tool Type *
                </label>
                <Select 
                  value={newTool.toolType} 
                  onValueChange={(value: 'BUILTIN' | 'MCP') => 
                    setNewTool(prev => ({ ...prev, toolType: value }))
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="BUILTIN" className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Built-in Tool
                      </div>
                    </SelectItem>
                    <SelectItem value="MCP" className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        MCP Connection
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Description
              </label>
              <Textarea
                value={newTool.description}
                onChange={(e) => setNewTool(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this tool does and how it helps users..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                rows={3}
              />
            </div>

            {/* MCP Configuration */}
            {newTool.toolType === 'MCP' && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  MCP Connection Configuration
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Connection URL *
                    </label>
                    <Input
                      value={newTool.mcpConnectionUrl}
                      onChange={(e) => setNewTool(prev => ({ ...prev, mcpConnectionUrl: e.target.value }))}
                      placeholder="wss://mcp-server.example.com or http://localhost:3001/mcp"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                    <p className="text-xs text-white/50 mt-1">
                      WebSocket URL or HTTP endpoint for the MCP server
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Authentication Type
                      </label>
                      <Select 
                        value={newTool.mcpAuthType} 
                        onValueChange={(value: 'NONE' | 'API_KEY' | 'BEARER_TOKEN' | 'BASIC_AUTH') => 
                          setNewTool(prev => ({ ...prev, mcpAuthType: value }))
                        }
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          <SelectItem value="NONE" className="text-white hover:bg-white/10">None</SelectItem>
                          <SelectItem value="API_KEY" className="text-white hover:bg-white/10">API Key</SelectItem>
                          <SelectItem value="BEARER_TOKEN" className="text-white hover:bg-white/10">Bearer Token</SelectItem>
                          <SelectItem value="BASIC_AUTH" className="text-white hover:bg-white/10">Basic Auth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Timeout (ms)
                      </label>
                      <Input
                        type="number"
                        value={newTool.mcpTimeout}
                        onChange={(e) => setNewTool(prev => ({ ...prev, mcpTimeout: parseInt(e.target.value) || 30000 }))}
                        placeholder="30000"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>

                  {newTool.mcpAuthType !== 'NONE' && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Authentication Token *
                      </label>
                      <Input
                        type="password"
                        value={newTool.mcpAuthToken}
                        onChange={(e) => setNewTool(prev => ({ ...prev, mcpAuthToken: e.target.value }))}
                        placeholder="Enter your API key or token..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      />
                      <p className="text-xs text-white/50 mt-1">
                        This will be securely encrypted and stored
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCreateTool}
                disabled={!newTool.name.trim() || (newTool.toolType === 'MCP' && !newTool.mcpConnectionUrl.trim())}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Tool
              </Button>
              <Button
                onClick={() => {
                  setNewTool({ 
                    name: '', 
                    description: '',
                    toolType: 'BUILTIN',
                    mcpConnectionUrl: '',
                    mcpAuthType: 'NONE',
                    mcpAuthToken: '',
                    mcpTimeout: 30000
                  })
                  setIsCreating(false)
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tools List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Existing Tools ({tools.length})</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-white/60">Loading tools...</div>
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <Settings className="h-12 w-12 mx-auto mb-4 text-white/30" />
            <p>No tools found</p>
            <p className="text-sm text-white/40 mt-1">Create your first tool to get started</p>
          </div>
        ) : (
          tools.map((tool) => {
            const Icon = getToolIcon(tool.name, tool.toolType)
            const isEditing = editingTool?.id === tool.id

            return (
              <div
                key={tool.id}
                className="bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/10 transition-colors"
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Tool Name *
                      </label>
                      <Input
                        value={editingTool.name}
                        onChange={(e) => setEditingTool(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Description
                      </label>
                      <Textarea
                        value={editingTool.description || ''}
                        onChange={(e) => setEditingTool(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="bg-white/5 border-white/20 text-white"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-white/80">
                        Enabled
                      </label>
                      <button
                        onClick={() => setEditingTool(prev => prev ? { ...prev, enabled: !prev.enabled } : null)}
                        className="flex items-center"
                      >
                        {editingTool.enabled ? (
                          <ToggleRight className="h-6 w-6 text-primary" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-white/40" />
                        )}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateTool(editingTool)}
                        disabled={!editingTool.name.trim()}
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingTool(null)}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`
                        w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
                        ${tool.enabled ? 'bg-primary/20' : 'bg-white/10'}
                        ${tool.toolType === 'MCP' ? 'ring-2 ring-blue-500/30' : ''}
                      `}>
                        <Icon className={`h-6 w-6 ${tool.enabled ? 'text-primary' : 'text-white/40'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-semibold ${tool.enabled ? 'text-white' : 'text-white/60'}`}>
                            {tool.name}
                          </h3>
                          {tool.toolType === 'MCP' && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                              MCP
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleEnabled(tool)}
                            className="flex items-center"
                          >
                            {tool.enabled ? (
                              <ToggleRight className="h-5 w-5 text-primary" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-white/40" />
                            )}
                          </button>
                        </div>
                        {tool.description && (
                          <p className="text-white/70 text-sm mb-2">{tool.description}</p>
                        )}
                        {tool.toolType === 'MCP' && tool.mcpConnectionUrl && (
                          <div className="text-xs text-blue-400/70 mb-2">
                            <Globe className="h-3 w-3 inline mr-1" />
                            {tool.mcpConnectionUrl}
                          </div>
                        )}
                        <div className="text-xs text-white/50">
                          {tool.createdAt && (
                            <>Created: {new Date(tool.createdAt).toLocaleDateString()}</>
                          )}
                          {tool.updatedAt && tool.updatedAt !== tool.createdAt && (
                            <span className="ml-3">
                              Updated: {new Date(tool.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => setEditingTool(tool)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteTool(tool.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
} 