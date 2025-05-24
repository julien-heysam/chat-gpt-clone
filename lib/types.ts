// Shared type definitions for the application

export interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  model?: string
  latency?: number // Response latency in milliseconds
  inputTokens?: number // Number of input tokens used
  outputTokens?: number // Number of output tokens generated
  cost?: number // Cost in USD for this message
  createdAt: string
}

export interface Document {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  folderId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: string
  title: string
  updatedAt: string
  _count?: {
    messages: number
  }
}

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface FolderItem {
  id: string
  name: string
  systemPrompt?: string | null
  conversationCount: number
  documentCount?: number
}

export interface UserSettings {
  globalSystemPrompt?: string | null
} 