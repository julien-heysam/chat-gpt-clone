"use client"

import { useEffect, useRef } from "react"
import { User, Bot, Sparkles, Clock, Copy, Check, DollarSign, Trash2, Wrench, Terminal } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from "react"
import { formatCost } from "@/lib/models"

interface ToolCall {
  id: string
  name: string
  input: any
  output?: string
  status: 'calling' | 'success' | 'error'
  error?: string
}

interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  model?: string
  latency?: number
  inputTokens?: number
  outputTokens?: number
  cost?: number
  createdAt: string
  toolCalls?: ToolCall[]
}

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  conversationId?: string
  onMessagesDeleted?: (deletedMessageIds: string[]) => void
}

function CodeBlock({ children, className, ...props }: any) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (language) {
    return (
      <div className="relative group my-4">
        <div className="flex items-center justify-between bg-white/10 px-4 py-2 text-sm text-white/60 rounded-t-lg border border-white/20">
          <span>{language}</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          className="!mt-0 !rounded-t-none !border-t-0"
          customStyle={{
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderTop: 'none'
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    )
  }

  return (
    <code className="bg-white/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono border border-white/20" {...props}>
      {children}
    </code>
  )
}

function ToolCallBox({ toolCall }: { toolCall: ToolCall }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusIcon = () => {
    switch (toolCall.status) {
      case 'calling':
        return <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
      case 'success':
        return <Wrench className="h-4 w-4 text-green-400" />
      case 'error':
        return <Terminal className="h-4 w-4 text-red-400" />
      default:
        return <Wrench className="h-4 w-4 text-white/60" />
    }
  }

  const getStatusColor = () => {
    switch (toolCall.status) {
      case 'calling':
        return 'border-blue-400/30 bg-blue-500/10'
      case 'success':
        return 'border-green-400/30 bg-green-500/10'
      case 'error':
        return 'border-red-400/30 bg-red-500/10'
      default:
        return 'border-white/20 bg-white/5'
    }
  }

  const getStatusText = () => {
    switch (toolCall.status) {
      case 'calling':
        return 'Running...'
      case 'success':
        return 'Completed'
      case 'error':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className={`relative rounded-lg border backdrop-blur-sm p-4 mb-3 ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium text-white text-sm">{toolCall.name}</span>
          <span className="text-xs text-white/60 px-2 py-0.5 bg-white/10 rounded-full">
            {getStatusText()}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <span className="text-xs">{isExpanded ? 'Hide details' : 'Show details'}</span>
        </button>
      </div>

      {/* Input (always visible for calling/error states) */}
      {(toolCall.status === 'calling' || toolCall.status === 'error' || isExpanded) && toolCall.input && (
        <div className="mb-3">
          <div className="text-xs text-white/60 mb-1">Input:</div>
          <div className="bg-white/5 rounded p-2 text-sm text-white/80 font-mono border border-white/10">
            {typeof toolCall.input === 'string' ? toolCall.input : JSON.stringify(toolCall.input, null, 2)}
          </div>
        </div>
      )}

      {/* Output */}
      {toolCall.output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/60">Output:</span>
            {toolCall.output && (
              <button
                onClick={() => copyToClipboard(toolCall.output!)}
                className="text-white/60 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
          </div>
          <div className="bg-white/5 rounded p-3 text-sm text-white/90 border border-white/10 max-h-40 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono">{toolCall.output}</pre>
          </div>
        </div>
      )}

      {/* Error */}
      {toolCall.error && (
        <div>
          <div className="text-xs text-red-400 mb-1">Error:</div>
          <div className="bg-red-500/10 border border-red-400/30 rounded p-2 text-sm text-red-300">
            {toolCall.error}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {toolCall.status === 'calling' && (
        <div className="flex items-center gap-2 text-blue-400 text-sm">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <span>Executing tool...</span>
        </div>
      )}
    </div>
  )
}

export function MessageList({ messages, isLoading, conversationId, onMessagesDeleted }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ messageId: string; content: string } | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const copyMessageContent = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const deleteMessageAndFollowing = async (messageId: string) => {
    if (!conversationId) return
    
    setDeletingMessageId(messageId)
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        // Notify parent component about the deleted messages
        onMessagesDeleted?.(result.deletedMessageIds)
      } else {
        const errorData = await response.json()
        console.error('Failed to delete messages:', errorData.error)
        alert(`Failed to delete messages: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting messages:', error)
      alert('Failed to delete messages. Please try again.')
    } finally {
      setDeletingMessageId(null)
      setDeleteConfirmation(null)
    }
  }

  const handleDeleteConfirm = (messageId: string, content: string) => {
    const preview = content.length > 50 ? content.slice(0, 50) + '...' : content
    setDeleteConfirmation({ messageId, content: preview })
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmation(null)
  }

  const tableCellComponents = {
    strong: ({ children }: any) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-white/90">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-white/10 text-primary px-1 py-0.5 rounded text-xs font-mono">{children}</code>
    ),
    // Prevent nested tables and other block elements
    p: ({ children }: any) => <span>{children}</span>,
    table: ({ children }: any) => <span>{children}</span>,
    thead: ({ children }: any) => <span>{children}</span>,
    tbody: ({ children }: any) => <span>{children}</span>,
    tr: ({ children }: any) => <span>{children}</span>,
    th: ({ children }: any) => <span>{children}</span>,
    td: ({ children }: any) => <span>{children}</span>,
  }

  const markdownComponents = {
    code: CodeBlock,
    pre: ({ children }: any) => <div className="overflow-hidden rounded-lg">{children}</div>,
    h1: ({ children }: any) => <h1 className="text-2xl font-bold mb-4 text-white border-b border-white/20 pb-2">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-bold mb-3 text-white border-b border-white/20 pb-1">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-semibold mb-2 text-white">{children}</h3>,
    p: ({ children }: any) => <p className="mb-3 text-white/90 leading-relaxed">{children}</p>,
    ul: ({ children }: any) => <ul className="mb-3 ml-4 space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="mb-3 ml-4 space-y-1 list-decimal">{children}</ol>,
    li: ({ children }: any) => <li className="text-white/90 marker:text-primary">{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-white/80 my-4 bg-primary/5 py-2 rounded-r">
        {children}
      </blockquote>
    ),
    strong: ({ children }: any) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-white/90">{children}</em>,
    a: ({ children, href }: any) => (
      <a href={href} className="text-primary hover:text-primary/80 underline transition-colors" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-white/20 bg-white/5">
        <table className="min-w-full divide-y divide-white/20">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-white/10">{children}</thead>,
    tbody: ({ children }: any) => <tbody className="bg-white/5 divide-y divide-white/10">{children}</tbody>,
    tr: ({ children }: any) => <tr className="hover:bg-white/10 transition-colors">{children}</tr>,
    th: ({ children }: any) => (
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider border-b border-white/20 align-top">
        <ReactMarkdown components={tableCellComponents} className="inline leading-relaxed">
          {children}
        </ReactMarkdown>
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-3 text-sm text-white/90 break-words align-top">
        <ReactMarkdown components={tableCellComponents} className="inline leading-relaxed">
          {children}
        </ReactMarkdown>
      </td>
    ),
    hr: () => <hr className="my-6 border-white/20" />,
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 relative">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Shooting stars */}
        <div className="shooting-star shooting-star-1"></div>
        <div className="shooting-star shooting-star-2"></div>
        <div className="shooting-star shooting-star-3"></div>
        <div className="shooting-star shooting-star-4"></div>
        <div className="shooting-star shooting-star-5"></div>
        
        {/* Floating orbs */}
        <div className="floating-orb floating-orb-1"></div>
        <div className="floating-orb floating-orb-2"></div>
        <div className="floating-orb floating-orb-3"></div>
        
        {/* Morphing blobs */}
        <div className="morphing-blob" style={{
          width: '200px',
          height: '200px',
          top: '10%',
          left: '80%',
          animationDelay: '0s'
        }}></div>
        <div className="morphing-blob" style={{
          width: '150px',
          height: '150px',
          bottom: '20%',
          left: '10%',
          animationDelay: '-10s'
        }}></div>
        
        {/* Particle system */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${20 + Math.random() * 10}s`
            }}
          />
        ))}
        
        {/* Glowing gradients */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-pink-500/10 to-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/6 w-32 h-32 rounded-full bg-gradient-to-r from-green-500/10 to-purple-500/10 blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-4 relative z-10">
        {messages.map((message) => (
          <div key={message.id} className="space-y-3">
            {/* Tool Calls - shown as separate boxes */}
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mx-auto max-w-2xl">
                {message.toolCalls.map((toolCall) => (
                  <ToolCallBox key={toolCall.id} toolCall={toolCall} />
                ))}
              </div>
            )}

            {/* Regular Message */}
            <div
              className={`flex gap-3 group ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div
                className={`relative rounded-xl p-4 ${
                  message.role === "user"
                    ? "max-w-[85%] bg-gradient-to-r from-purple-500/60 to-blue-500/60 text-white ml-auto shadow-md border border-white/15 backdrop-blur-sm"
                    : "w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 shadow-lg"
                }`}
              >
                {/* Add delete button for user messages only */}
                {conversationId && message.role === "user" && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleDeleteConfirm(message.id, message.content)}
                      disabled={deletingMessageId === message.id}
                      className="h-6 w-6 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all duration-200 flex items-center justify-center group/button"
                      title="Delete this message and all following"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {message.role === "assistant" ? (
                  <>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
                
                {/* Combined footer section */}
                <div className="text-xs text-white/50 mt-3 border-t border-white/10 pt-2">
                  {/* Metadata row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span>
                        {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {/* Copy button for assistant messages */}
                      {message.role === "assistant" && (
                        <button
                          onClick={() => copyMessageContent(message.content, message.id)}
                          className="flex items-center gap-1 text-xs text-white/60 hover:text-white/80 transition-colors group"
                        >
                          {copiedMessageId === message.id ? (
                            <>
                              <Check className="h-3 w-3 text-green-400" />
                              <span className="text-green-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 group-hover:text-white/80" />
                              <span>Copy message</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2">
                        {message.model && (
                          <span className="text-xs text-purple-300 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 rounded-full border border-purple-400/40 font-medium shadow-lg backdrop-blur-sm">
                            {message.model}
                          </span>
                        )}
                        {message.latency && (
                          <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-2 py-1 rounded-full border border-blue-400/40">
                            <Clock className="h-3 w-3 text-blue-300" />
                            <span className="text-xs text-blue-300 font-medium">
                              {message.latency}ms
                            </span>
                          </div>
                        )}
                        {message.cost !== undefined && message.cost > 0 && (
                          <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500/20 to-green-500/20 px-2 py-1 rounded-full border border-emerald-400/40">
                            <DollarSign className="h-3 w-3 text-emerald-300" />
                            <span className="text-xs text-emerald-300 font-medium">
                              {formatCost(message.cost)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-white/70 animate-pulse" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <span className="text-sm text-white/70">Neural processing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/20 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Messages</h3>
                <p className="text-sm text-white/60">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">"{deleteConfirmation.content}"</span>{" "}
              and all following messages?
              <br />
              <span className="text-sm text-white/60 mt-2 block">
                This will permanently remove all messages from this point onwards in the conversation.
              </span>
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm text-white/80 hover:text-white border border-white/20 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMessageAndFollowing(deleteConfirmation.messageId)}
                disabled={deletingMessageId === deleteConfirmation.messageId}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
                {deletingMessageId === deleteConfirmation.messageId ? 'Deleting...' : 'Delete Messages'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 