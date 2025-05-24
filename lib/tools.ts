import { 
  Globe, 
  Calculator, 
  Code, 
  Image, 
  FileText, 
  Settings,
  Zap,
  Link
} from "lucide-react"

export interface Tool {
  id: string
  name: string
  description?: string | null
  enabled: boolean
  createdAt?: string
  updatedAt?: string
  
  // MCP Connection Fields
  toolType?: 'BUILTIN' | 'MCP'
  mcpConnectionUrl?: string | null
  mcpAuthType?: 'NONE' | 'API_KEY' | 'BEARER_TOKEN' | 'BASIC_AUTH' | null
  mcpAuthToken?: string | null
  mcpSchema?: any | null // JSON schema
  mcpTimeout?: number | null
}

export const getToolIcon = (toolName: string, toolType?: string) => {
  // MCP tools get a special icon
  if (toolType === 'MCP') return Link
  
  const name = toolName.toLowerCase()
  if (name.includes('search') || name.includes('web')) return Globe
  if (name.includes('calculator') || name.includes('math')) return Calculator
  if (name.includes('code') || name.includes('interpreter')) return Code
  if (name.includes('dall-e') || name.includes('image')) return Image
  if (name.includes('document') || name.includes('analysis')) return FileText
  return Settings
} 