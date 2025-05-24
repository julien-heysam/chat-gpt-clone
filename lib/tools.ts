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
  Layers,
  Clock,
  Rss,
  FileType,
  Archive,
  Wifi,
  Lock,
  Activity,
  BarChart3,
  Smartphone,
  Music,
  Camera,
  Mic,
  Monitor,
  Upload,
  Download,
  Network,
  Package,
  Wrench,
  Terminal,
  GitBranch,
  Eye,
  PlayCircle,
  Share2,
  FileImage,
  Headphones,
  Award,
  Building,
  Gamepad2,
  Scissors,
  MousePointer,
  Router,
  Webhook,
  Cpu,
  Binary,
  Compass
} from "lucide-react"

export interface Tool {
  id: string
  name: string
  description?: string | null
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
  
  // Official Reference Servers (highest priority)
  if (name === 'brave search') return Search
  if (name === 'fetch') return Globe
  if (name === 'github') return Github
  if (name === 'filesystem') return Folder
  if (name === 'everything') return Package
  if (name === 'postgresql') return Database
  if (name === 'sqlite') return Database
  if (name === 'everart') return Palette
  if (name === 'puppeteer') return Bot
  if (name === 'sequential thinking') return Brain
  if (name === 'aws kb retrieval') return Cloud
  if (name === 'kubernetes') return Layers
  if (name === 'memory') return Brain

  // Web Browsing & Automation
  if (name === 'playwright') return Monitor
  if (name === 'selenium') return Bot
  if (name === 'applescript') return Terminal
  if (name === 'youtube transcript') return FileText

  // Development Tools
  if (name === 'git') return GitBranch
  if (name === 'docker') return Container
  if (name === 'gitlab') return Github
  if (name === 'linear') return Target
  if (name === 'jira') return CheckSquare
  if (name === 'azure devops') return Cloud
  if (name === 'sentry') return Bug
  if (name === 'raycast') return Zap

  // Databases & Analytics
  if (name === 'mysql') return Database
  if (name === 'mongodb') return Database
  if (name === 'redis') return Database
  if (name === 'neo4j') return Database
  if (name === 'bigquery') return BarChart3
  if (name === 'snowflake') return Database
  if (name === 'supabase') return Database
  if (name === 'firebase') return Database
  if (name === 'influxdb') return Database

  // Google Services
  if (name === 'google drive') return Cloud
  if (name === 'google maps') return Map
  if (name === 'google sheets') return Table
  if (name === 'gmail') return Mail
  if (name === 'google calendar') return Calendar
  if (name === 'google search') return Search

  // Communication & Social
  if (name === 'slack') return MessageSquare
  if (name === 'discord') return MessageSquare
  if (name === 'whatsapp') return MessageSquare
  if (name === 'telegram') return MessageSquare
  if (name === 'x (twitter)') return MessageSquare
  if (name === 'mastodon') return MessageSquare
  if (name === 'reddit') return Users

  // File & Document Management
  if (name === 'pdf tools') return FileX
  if (name === 'notion') return BookOpen
  if (name === 'obsidian') return BookOpen
  if (name === 'confluence') return BookOpen
  if (name === 'sharepoint') return BookOpen
  if (name === 'onedrive') return Cloud
  if (name === 'dropbox') return Cloud
  if (name === 'box') return Cloud

  // E-commerce & Business
  if (name === 'shopify') return ShoppingBag
  if (name === 'stripe') return CreditCard
  if (name === 'paypal') return CreditCard
  if (name === 'salesforce') return Building
  if (name === 'hubspot') return Building
  if (name === 'zendesk') return Headphones
  if (name === 'freshdesk') return Headphones
  if (name === 'intercom') return MessageSquare

  // Media & Content
  if (name === 'spotify') return Music
  if (name === 'youtube') return PlayCircle
  if (name === 'twitch') return Video
  if (name === 'instagram') return Camera
  if (name === 'unsplash') return Image
  if (name === 'pexels') return Image
  if (name === 'gimp') return Image
  if (name === 'imagemagick') return Image

  // Task & Project Management
  if (name === 'todoist') return CheckSquare
  if (name === 'trello') return CheckSquare
  if (name === 'asana') return CheckSquare
  if (name === 'monday.com') return CheckSquare
  if (name === 'clickup') return CheckSquare
  if (name === 'basecamp') return CheckSquare
  if (name === 'airtable') return Table

  // Cloud Platforms
  if (name === 'aws') return Cloud
  if (name === 'azure') return Cloud
  if (name === 'gcp') return Cloud
  if (name === 'digitalocean') return Cloud
  if (name === 'vultr') return Cloud
  if (name === 'linode') return Cloud
  if (name === 'heroku') return Cloud
  if (name === 'vercel') return Cloud
  if (name === 'netlify') return Cloud

  // Analytics & Monitoring
  if (name === 'google analytics') return BarChart3
  if (name === 'mixpanel') return BarChart3
  if (name === 'amplitude') return BarChart3
  if (name === 'segment') return BarChart3
  if (name === 'new relic') return Activity
  if (name === 'datadog') return Activity
  if (name === 'grafana') return BarChart3
  if (name === 'prometheus') return Activity

  // Utilities & Tools
  if (name === 'qr code') return QrCode
  if (name === 'time') return Clock
  if (name === 'mcp-server-weather' || name === 'weather api' || name === 'weather') return Sun
  if (name === 'rss') return Rss
  if (name === 'mcp-server-url-shortener' || name === 'url shortener api' || name === 'url shortener') return Link
  if (name === 'mcp-server-email-validator' || name === 'email validator') return Mail
  if (name === 'mcp-server-password-generator' || name === 'password generator api' || name === 'password generator') return Key
  if (name === 'base64') return Binary
  if (name === 'json tools') return Braces
  if (name === 'xml tools') return Code
  if (name === 'csv tools') return FileType
  if (name === 'zip tools') return Archive

  // Cryptocurrency & Finance
  if (name === 'coinbase') return DollarSign
  if (name === 'binance') return DollarSign
  if (name === 'coingecko') return DollarSign
  if (name === 'alpha vantage') return TrendingUp
  if (name === 'yahoo finance') return TrendingUp
  if (name === 'iex cloud') return TrendingUp

  // Meeting & Video
  if (name === 'zoom') return Video
  if (name === 'google meet') return Video
  if (name === 'microsoft teams') return Video
  if (name === 'calendly') return Calendar
  if (name === 'loom') return Video

  // Security & Identity
  if (name === '1password') return Lock
  if (name === 'bitwarden') return Lock
  if (name === 'auth0') return Shield
  if (name === 'okta') return Shield
  if (name === 'vault') return Lock

  // Specialized Tools
  if (name === 'ifttt') return Zap
  if (name === 'zapier') return Zap
  if (name === 'webhook') return Webhook
  if (name === 'ssh') return Terminal
  if (name === 'ftp') return Upload
  if (name === 'sftp') return Upload
  if (name === 'ping') return Wifi
  if (name === 'dns') return Network
  if (name === 'whois') return Search
  if (name === 'ssl certificate') return Shield

  // Legacy/fallback mappings
  if (name.includes('github')) return Github
  if (name.includes('gitlab')) return Github
  if (name.includes('git')) return GitBranch
  if (name.includes('database') || name.includes('sql')) return Database
  if (name.includes('search')) return Search
  if (name.includes('slack') || name.includes('discord') || name.includes('chat')) return MessageSquare
  if (name.includes('calendar')) return Calendar
  if (name.includes('weather')) return Sun
  if (name.includes('news')) return Newspaper
  if (name.includes('translate')) return Languages
  if (name.includes('qr')) return QrCode
  if (name.includes('pdf')) return FileX
  if (name.includes('image')) return Image
  if (name.includes('video')) return Video
  if (name.includes('music') || name.includes('audio')) return Music
  if (name.includes('stock') || name.includes('finance')) return TrendingUp
  if (name.includes('currency') || name.includes('crypto')) return DollarSign
  if (name.includes('password')) return Key
  if (name.includes('hash')) return Hash
  if (name.includes('json')) return Braces
  if (name.includes('cloud') || name.includes('aws') || name.includes('azure')) return Cloud
  if (name.includes('docker') || name.includes('container')) return Container
  if (name.includes('kubernetes')) return Layers
  if (name.includes('monitor') || name.includes('analytics')) return BarChart3
  if (name.includes('security') || name.includes('auth')) return Shield
  if (name.includes('automation')) return Zap
  if (name.includes('file') || name.includes('storage')) return Folder
  if (name.includes('email') || name.includes('mail')) return Mail
  if (name.includes('phone') || name.includes('sms')) return Phone

  // Default fallbacks by tool type
  if (toolType === 'MCP') return Server
  if (toolType === 'BUILTIN') return Cog
  
  return Settings // Ultimate fallback
} 