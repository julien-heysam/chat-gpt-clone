import { 
  Globe, 
  Calculator, 
  Code, 
  Image, 
  FileText, 
  Settings,
  Zap,
  Link,
  Github,
  Database,
  Search,
  Bot,
  MessageSquare,
  Map,
  Brain,
  Video,
  Target,
  BookOpen,
  Table,
  Cloud,
  Container,
  Shield,
  Bug,
  ShoppingBag,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  Users,
  TrendingUp,
  DollarSign,
  Languages,
  QrCode,
  FileX,
  Palette,
  Braces,
  Hash,
  Key,
  Sun,
  Newspaper,
  Folder,
  HardDrive,
  Server,
  Cog,
  Layers
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
  const name = toolName.toLowerCase()
  
  // Specific tool name mappings (most specific first)
  if (name === 'github') return Github
  if (name === 'gitlab') return Github
  if (name === 'git') return Code
  if (name === 'postgresql' || name === 'sqlite') return Database
  if (name === 'filesystem') return Folder
  if (name === 'google drive') return Cloud
  if (name === 'brave search') return Search
  if (name === 'fetch') return Globe
  if (name === 'puppeteer') return Bot
  if (name === 'everart') return Palette
  if (name === 'slack') return MessageSquare
  if (name === 'discord') return MessageSquare
  if (name === 'google maps') return Map
  if (name === 'memory') return Brain
  if (name === 'youtube') return Video
  if (name === 'linear') return Target
  if (name === 'notion') return BookOpen
  if (name === 'airtable') return Table
  if (name === 'aws s3') return Cloud
  if (name === 'docker') return Container
  if (name === 'kubernetes') return Layers
  if (name === 'sentry') return Bug
  if (name === 'jira') return CheckSquare
  if (name === 'confluence') return BookOpen
  if (name === 'shopify') return ShoppingBag
  if (name === 'stripe') return CreditCard
  if (name === 'twilio') return Phone
  if (name === 'sendgrid') return Mail
  if (name === 'calendar') return Calendar
  if (name === 'todoist') return CheckSquare
  if (name === 'trello') return CheckSquare
  if (name === 'reddit') return Users
  if (name === 'twitter/x') return MessageSquare
  if (name === 'hackernews') return TrendingUp
  if (name === 'weather') return Sun
  if (name === 'news api') return Newspaper
  if (name === 'stock market') return TrendingUp
  if (name === 'currency exchange') return DollarSign
  if (name === 'translation') return Languages
  if (name === 'qr code') return QrCode
  if (name === 'pdf tools') return FileX
  if (name === 'image processing') return Image
  if (name === 'json tools') return Braces
  if (name === 'url shortener') return Link
  if (name === 'password generator') return Key
  if (name === 'hash calculator') return Hash
  
  // Fallback patterns for built-in tools and general categories
  if (name.includes('search') || name.includes('web')) return Globe
  if (name.includes('calculator') || name.includes('math')) return Calculator
  if (name.includes('code') || name.includes('interpreter')) return Code
  if (name.includes('dall-e') || name.includes('image')) return Image
  if (name.includes('document') || name.includes('analysis')) return FileText
  if (name.includes('database') || name.includes('sql')) return Database
  if (name.includes('file') || name.includes('storage')) return HardDrive
  if (name.includes('server') || name.includes('api')) return Server
  
  // Default icons based on tool type
  if (toolType === 'MCP') return Cog
  return Settings
} 