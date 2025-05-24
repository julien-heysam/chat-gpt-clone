"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, 
  ToggleLeft, 
  ToggleRight, 
  Settings,
  Key,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Filter,
  Eye,
  EyeOff
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getToolIcon } from "@/lib/tools"

interface Tool {
  id: string
  name: string
  description?: string | null
  toolType: 'BUILTIN' | 'MCP'
  mcpConnectionUrl?: string | null
  mcpAuthType?: 'NONE' | 'API_KEY' | 'BEARER_TOKEN' | 'BASIC_AUTH' | null
  mcpTimeout?: number | null
}

interface UserTool {
  id: string
  enabled: boolean
  userMcpAuthToken?: string | null
  tool: Tool
}

export function MCPToolsSettings() {
  const [userTools, setUserTools] = useState<UserTool[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [savingToolId, setSavingToolId] = useState<string | null>(null)
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})

  // Category mapping based on tool names
  const getToolCategory = (toolName: string): string => {
    const name = toolName.toLowerCase()
    
    if (['brave search', 'fetch', 'github', 'filesystem', 'everything', 'postgresql', 'sqlite', 'everart', 'puppeteer', 'sequential thinking', 'aws kb retrieval', 'kubernetes', 'memory'].includes(name)) {
      return 'Official'
    }
    if (['playwright', 'selenium', 'applescript', 'youtube transcript'].includes(name)) {
      return 'Web Browsing'
    }
    if (['git', 'docker', 'gitlab', 'linear', 'jira', 'azure devops', 'sentry', 'raycast'].includes(name)) {
      return 'Development'
    }
    if (['mysql', 'mongodb', 'redis', 'neo4j', 'bigquery', 'snowflake', 'supabase', 'firebase', 'influxdb'].includes(name)) {
      return 'Databases'
    }
    if (name.startsWith('google ')) {
      return 'Google Services'
    }
    if (['slack', 'discord', 'whatsapp', 'telegram', 'x (twitter)', 'mastodon', 'reddit'].includes(name)) {
      return 'Communication'
    }
    if (['notion', 'obsidian', 'confluence', 'sharepoint', 'onedrive', 'dropbox', 'box', 'pdf tools'].includes(name)) {
      return 'Documents'
    }
    if (['shopify', 'stripe', 'paypal', 'salesforce', 'hubspot', 'zendesk', 'freshdesk', 'intercom'].includes(name)) {
      return 'Business'
    }
    if (['spotify', 'youtube', 'twitch', 'instagram', 'unsplash', 'pexels', 'gimp', 'imagemagick'].includes(name)) {
      return 'Media'
    }
    if (['todoist', 'trello', 'asana', 'monday.com', 'clickup', 'basecamp', 'airtable'].includes(name)) {
      return 'Productivity'
    }
    if (['aws', 'azure', 'gcp', 'digitalocean', 'vultr', 'linode', 'heroku', 'vercel', 'netlify'].includes(name)) {
      return 'Cloud'
    }
    if (['google analytics', 'mixpanel', 'amplitude', 'segment', 'new relic', 'datadog', 'grafana', 'prometheus'].includes(name)) {
      return 'Analytics'
    }
    if (['qr code', 'time', 'mcp-server-weather', 'weather api', 'weather', 'rss', 'mcp-server-url-shortener', 'url shortener api', 'url shortener', 'mcp-server-email-validator', 'email validator', 'mcp-server-password-generator', 'password generator api', 'password generator', 'base64', 'json tools', 'xml tools', 'csv tools', 'zip tools'].includes(name)) {
      return 'Utilities'
    }
    if (['coinbase', 'binance', 'coingecko', 'alpha vantage', 'yahoo finance', 'iex cloud'].includes(name)) {
      return 'Finance'
    }
    if (['zoom', 'google meet', 'microsoft teams', 'calendly', 'loom'].includes(name)) {
      return 'Meetings'
    }
    if (['1password', 'bitwarden', 'auth0', 'okta', 'vault'].includes(name)) {
      return 'Security'
    }
    
    return 'Other'
  }

  const categories = [
    'all',
    'Official',
    'Web Browsing',
    'Development', 
    'Databases',
    'Google Services',
    'Communication',
    'Documents',
    'Business',
    'Media',
    'Productivity',
    'Cloud',
    'Analytics',
    'Utilities',
    'Finance',
    'Meetings',
    'Security',
    'Other'
  ]

  useEffect(() => {
    loadUserTools()
  }, [])

  // Explicitly clear search term on mount to prevent autofill
  useEffect(() => {
    setSearchTerm("")
    // Also clear after a short delay in case autofill happens after mount
    const timeoutId = setTimeout(() => {
      setSearchTerm("")
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [])

  const loadUserTools = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/tools')
      if (response.ok) {
        const data = await response.json()
        setUserTools(data)
      } else {
        console.error('Failed to load user tools')
      }
    } catch (error) {
      console.error('Error loading user tools:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTool = async (userToolId: string, enabled: boolean) => {
    try {
      setSavingToolId(userToolId)
      const response = await fetch(`/api/user/tools/${userToolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        setUserTools(prev => prev.map(ut => 
          ut.id === userToolId ? { ...ut, enabled } : ut
        ))
      } else {
        console.error('Failed to toggle tool')
      }
    } catch (error) {
      console.error('Error toggling tool:', error)
    } finally {
      setSavingToolId(null)
    }
  }

  const updateAuthToken = async (userToolId: string, token: string) => {
    try {
      setSavingToolId(userToolId)
      const response = await fetch(`/api/user/tools/${userToolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMcpAuthToken: token })
      })

      if (response.ok) {
        setUserTools(prev => prev.map(ut => 
          ut.id === userToolId ? { ...ut, userMcpAuthToken: token } : ut
        ))
      } else {
        console.error('Failed to update auth token')
      }
    } catch (error) {
      console.error('Error updating auth token:', error)
    } finally {
      setSavingToolId(null)
    }
  }

  const filteredTools = userTools.filter(userTool => {
    const matchesSearch = userTool.tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userTool.tool.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || getToolCategory(userTool.tool.name) === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const enabledCount = userTools.filter(ut => ut.enabled).length
  const totalCount = userTools.length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <h2 className="text-2xl font-bold text-white">Loading MCP Tools...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">MCP Tools</h2>
        <p className="text-white/70">
          Enable and configure AI tools powered by the Model Context Protocol.
          <br />
          <span className="text-sm text-white/50">
            {enabledCount} of {totalCount} tools enabled
          </span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-white/80 font-medium">Enabled Tools</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{enabledCount}</div>
        </div>
        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <span className="text-white/80 font-medium">Available Tools</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{totalCount}</div>
        </div>
        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <span className="text-white/80 font-medium">Need Setup</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {userTools.filter(ut => ut.enabled && ut.tool.mcpAuthType !== 'NONE' && !ut.userMcpAuthToken).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            {/* Hidden dummy input to prevent autofill */}
            <input
              type="email"
              autoComplete="email"
              style={{ display: 'none' }}
              tabIndex={-1}
              aria-hidden="true"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              key="mcp-tools-search"
              type="search"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 pl-10 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              name="toolSearchField"
              role="search"
              data-form-type="other"
              data-lpignore="true"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-white/60" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/20">
              {categories.map(category => (
                <SelectItem key={category} value={category} className="text-white hover:bg-white/10">
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tools List */}
      <div className="space-y-4">
        {filteredTools.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <Settings className="h-12 w-12 mx-auto mb-4 text-white/30" />
            <p>No tools found matching your criteria</p>
          </div>
        ) : (
          filteredTools.map((userTool) => {
            const Icon = getToolIcon(userTool.tool.name, userTool.tool.toolType)
            const category = getToolCategory(userTool.tool.name)
            const needsAuth = userTool.tool.mcpAuthType !== 'NONE'
            const hasAuthToken = !!userTool.userMcpAuthToken
            const showToken = showTokens[userTool.id] || false
            
            return (
              <div
                key={userTool.id}
                className={`bg-white/5 border rounded-lg p-6 transition-all duration-300 ${
                  userTool.enabled
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-white/20 hover:border-white/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
                    userTool.enabled
                      ? 'bg-primary/20 border-primary/30 text-primary'
                      : 'bg-white/5 border-white/20 text-white/60'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{userTool.tool.name}</h3>
                          <span className="px-2 py-0.5 text-xs bg-white/10 text-white/70 rounded-full">
                            {category}
                          </span>
                          {userTool.tool.toolType === 'MCP' && (
                            <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                              MCP
                            </span>
                          )}
                        </div>
                        {userTool.tool.description && (
                          <p className="text-white/70 text-sm mb-3">{userTool.tool.description}</p>
                        )}

                        {/* Auth Configuration */}
                        {userTool.enabled && needsAuth && (
                          <div className="mt-4 p-4 bg-white/5 border border-white/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Key className="h-4 w-4 text-yellow-400" />
                              <span className="text-sm font-medium text-white">Authentication Required</span>
                            </div>
                            <p className="text-xs text-white/60 mb-3">
                              This tool requires a {userTool.tool.mcpAuthType?.replace('_', ' ').toLowerCase()} to function.
                            </p>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Input
                                  type={showToken ? "text" : "password"}
                                  placeholder={`Enter your ${userTool.tool.mcpAuthType?.replace('_', ' ').toLowerCase()}...`}
                                  value={userTool.userMcpAuthToken || ''}
                                  onChange={(e) => updateAuthToken(userTool.id, e.target.value)}
                                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowTokens(prev => ({ ...prev, [userTool.id]: !showToken }))}
                                className="px-3"
                              >
                                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                            {userTool.enabled && !hasAuthToken && (
                              <div className="flex items-center gap-2 mt-2 text-yellow-400">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs">Tool is enabled but won't work without authentication</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Connection Info */}
                        {userTool.tool.mcpConnectionUrl && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                            <ExternalLink className="h-3 w-3" />
                            <code className="bg-white/10 px-2 py-1 rounded">
                              {userTool.tool.mcpConnectionUrl}
                            </code>
                          </div>
                        )}
                      </div>

                      {/* Toggle */}
                      <div className="flex items-center gap-2">
                        {savingToolId === userTool.id ? (
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        ) : (
                          <button
                            onClick={() => toggleTool(userTool.id, !userTool.enabled)}
                            className="flex items-center gap-2 transition-colors"
                          >
                            {userTool.enabled ? (
                              <ToggleRight className="h-6 w-6 text-primary" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-white/40" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
} 