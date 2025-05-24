"use client"

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 p-4">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-sm">🤖</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
        <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
      </div>
    </div>
  )
} 