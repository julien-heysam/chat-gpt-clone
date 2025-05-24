"use client"

import { useEffect, useRef } from "react"
import { User, Bot, Sparkles, Clock, Copy, Check, DollarSign } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from "react"
import { formatCost } from "@/lib/models"

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
}

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
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
        <div className="flex items-center justify-between bg-zinc-800 px-4 py-2 text-sm text-zinc-400 rounded-t-lg border border-zinc-700">
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
            border: '1px solid rgb(63 63 70)',
            borderTop: 'none'
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    )
  }

  return (
    <code className="bg-zinc-800 text-primary px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-700" {...props}>
      {children}
    </code>
  )
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

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

  const tableCellComponents = {
    strong: ({ children }: any) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-white/90">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-zinc-800 text-primary px-1 py-0.5 rounded text-xs font-mono">{children}</code>
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
    h1: ({ children }: any) => <h1 className="text-2xl font-bold mb-4 text-white border-b border-zinc-700 pb-2">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-bold mb-3 text-white border-b border-zinc-700 pb-1">{children}</h2>,
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
      <div className="overflow-x-auto my-4 rounded-lg border border-zinc-700 bg-zinc-900/30">
        <table className="min-w-full divide-y divide-zinc-700">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-zinc-800/80">{children}</thead>,
    tbody: ({ children }: any) => <tbody className="bg-zinc-900/20 divide-y divide-zinc-700/50">{children}</tbody>,
    tr: ({ children }: any) => <tr className="hover:bg-zinc-800/30 transition-colors">{children}</tr>,
    th: ({ children }: any) => (
      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider border-b border-zinc-700 align-top">
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
    hr: () => <hr className="my-6 border-zinc-700" />,
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            
            <div
              className={`max-w-[85%] rounded-xl p-4 ${
                message.role === "user"
                  ? "bg-primary text-white ml-auto"
                  : "bg-zinc-900/50 text-white border border-zinc-700/50 backdrop-blur-sm"
              }`}
            >
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
                {/* Copy button for assistant messages */}
                {message.role === "assistant" && (
                  <div className="mb-2">
                    <button
                      onClick={() => copyMessageContent(message.content, message.id)}
                      className="flex items-center gap-2 text-xs text-white/60 hover:text-white/80 transition-colors group"
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
                  </div>
                )}
                
                {/* Metadata row */}
                <div className="flex items-center justify-between">
                  <span>
                    {new Date(message.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2">
                      {message.model && (
                        <span className="text-xs text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          {message.model}
                        </span>
                      )}
                      {message.latency && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-white/40" />
                          <span className="text-xs text-white/40">
                            {message.latency}ms
                          </span>
                        </div>
                      )}
                      {message.cost !== undefined && message.cost > 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-white/40" />
                          <span className="text-xs text-white/40">
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
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="bg-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm rounded-xl p-4">
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
    </div>
  )
} 