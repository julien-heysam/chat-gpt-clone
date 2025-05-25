"use client"

import { useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check } from "lucide-react"

export function CodeBlock({ children, className, ...props }: any) {
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