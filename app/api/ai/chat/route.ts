import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getModelById } from "@/lib/models"
import { searchSimilarChunks } from "@/lib/document-processing"
import { getSearchConfig } from "@/lib/document-config"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import { Tool } from "@/lib/tools"
import { mcpManager, MCP_SERVER_CONFIGS } from "@/lib/mcp-client"

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

// Helper function to convert our Tool objects to Anthropic's tool format
function convertToolsToAnthropicFormat(tools: Tool[]): Anthropic.Tool[] {
  return tools.map(tool => {
    // For MCP tools, use the actual MCP tool name that will be called
    let toolName = tool.name.toLowerCase().replace(/\s+/g, '_')
    if (tool.toolType === 'MCP') {
      const serverName = getServerNameForTool(tool.name)
      toolName = getMCPToolName(tool.name, serverName)
    }
    
    const toolNameLower = tool.name.toLowerCase()
    
    // Create tool-specific schemas
    let input_schema: any = {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          description: `Input for the ${tool.name} tool`
        }
      },
      required: ["query"]
    }

    // Customize schema based on tool type
    if (toolNameLower.includes('calculator') || toolNameLower.includes('math')) {
      input_schema = {
        type: "object" as const,
        properties: {
          expression: {
            type: "string" as const,
            description: "Mathematical expression to evaluate (e.g., '2 + 3 * 4', 'sqrt(16)', '10 / 2')"
          }
        },
        required: ["expression"]
      }
    } else if (toolNameLower.includes('password')) {
      input_schema = {
        type: "object" as const,
        properties: {
          length: {
            type: "string" as const,
            description: "Length of the password to generate (default: 12)"
          }
        },
        required: []
      }
    } else if (toolNameLower.includes('hash')) {
      input_schema = {
        type: "object" as const,
        properties: {
          text: {
            type: "string" as const,
            description: "Text to calculate hash for"
          }
        },
        required: ["text"]
      }
    } else if (toolNameLower.includes('time')) {
      input_schema = {
        type: "object" as const,
        properties: {},
        required: []
      }
    } else if (toolNameLower.includes('weather')) {
      input_schema = {
        type: "object" as const,
        properties: {
          location: {
            type: "string" as const,
            description: "Location to get weather for (e.g., 'New York', 'London, UK')"
          }
        },
        required: ["location"]
      }
    } else if (toolNameLower.includes('search') || toolName === 'brave_web_search') {
      input_schema = {
        type: "object" as const,
        properties: {
          query: {
            type: "string" as const,
            description: "Search query to find information on the web"
          }
        },
        required: ["query"]
      }
    }

    const anthropicTool: Anthropic.Tool = {
      name: toolName,
      description: tool.description || `Use the ${tool.name} tool`,
      input_schema
    }
    
    return anthropicTool
  })
}

// Helper function to execute tool calls
async function executeToolCall(toolUse: any, toolInput: any, availableTools: Tool[]): Promise<string> {
  const toolName = toolUse.name
  
  // Find the tool by matching the MCP tool name back to database tool name
  let tool = availableTools.find(t => {
    if (t.toolType === 'MCP') {
      const serverName = getServerNameForTool(t.name)
      const mcpToolName = getMCPToolName(t.name, serverName)
      return mcpToolName === toolName
    } else {
      // For built-in tools, use the standard name conversion
      return t.name.toLowerCase().replace(/\s+/g, '_') === toolName
    }
  })
  
  // Try alternative matching if not found
  if (!tool) {
    tool = availableTools.find(t => 
      t.name.toLowerCase() === toolName.replace(/_/g, ' ') ||
      t.name.toLowerCase().includes(toolName.replace(/_/g, ' ')) ||
      toolName.includes(t.name.toLowerCase().replace(/\s+/g, '_'))
    )
  }
  
  if (!tool) {
    const availableToolNames = availableTools.map(t => {
      if (t.toolType === 'MCP') {
        const serverName = getServerNameForTool(t.name)
        const mcpToolName = getMCPToolName(t.name, serverName)
        return `"${t.name}" (${mcpToolName})`
      } else {
        return `"${t.name}" (${t.name.toLowerCase().replace(/\s+/g, '_')})`
      }
    }).join(', ')
    throw new Error(`Tool "${toolName}" not found in available tools. Available: ${availableToolNames}`)
  }

  // Execute based on tool type
  if (tool.toolType === 'MCP') {
    return await executeMCPTool(tool, toolInput)
  } else {
    // Built-in tool execution
    return await executeBuiltinTool(tool, toolInput)
  }
}

// Execute MCP tools
async function executeMCPTool(tool: Tool, input: any): Promise<string> {
  try {
    // Map tool name to MCP server config
    const serverName = getServerNameForTool(tool.name)
    const serverConfig = MCP_SERVER_CONFIGS[serverName]
    
    if (!serverConfig) {
      return `MCP server configuration not found for tool: ${tool.name}`
    }

    // Connect to server if not already connected
    if (!mcpManager.isConnected(serverName)) {
      try {
        await mcpManager.connectToServer(serverConfig)
      } catch (error) {
        return `Failed to connect to MCP server: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }

    // Map the tool name to the actual MCP tool name
    const mcpToolName = getMCPToolName(tool.name, serverName)
    
    // Call the tool
    const result = await mcpManager.callTool(serverName, mcpToolName, input)
    
    // Format the result
    if (Array.isArray(result)) {
      return result.map(item => {
        if (typeof item === 'object' && item.type === 'text') {
          return item.text
        }
        return JSON.stringify(item)
      }).join('\n')
    } else if (typeof result === 'object' && result.type === 'text') {
      return result.text
    }
    
    return JSON.stringify(result)
    
  } catch (error) {
    console.error(`MCP tool execution error:`, error)
    return `MCP tool error: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

// Map database tool names to actual MCP tool names
function getMCPToolName(toolName: string, serverName: string): string {
  const name = toolName.toLowerCase()
  
  // Brave Search specific mappings
  if (serverName === 'brave-search') {
    if (name.includes('brave') && name.includes('search')) {
      // Default to web search for general "Brave Search" requests
      return 'brave_web_search'
    }
  }
  
  // Default: convert tool name to MCP format
  return name.replace(/\s+/g, '_')
}

// Map tool names to MCP server names
function getServerNameForTool(toolName: string): string {
  const name = toolName.toLowerCase()
  
  // Map common tool names to server names
  if (name.includes('search') || name.includes('brave')) return 'brave-search'
  if (name.includes('github')) return 'github'
  if (name.includes('postgres') || name.includes('database')) return 'postgres'
  
  // Default fallback
  return name.replace(/\s+/g, '-')
}

// Execute built-in tools
async function executeBuiltinTool(tool: Tool, input: any): Promise<string> {
  const toolName = tool.name.toLowerCase()

  switch (toolName) {
    case 'calculator':
      try {
        const expression = input.expression || input.query || ''
        // Simple math evaluation (be careful with eval in production!)
        const mathExpression = expression.replace(/[^0-9+\-*/().\s]/g, '')
        const result = Function(`"use strict"; return (${mathExpression})`)()
        return `Calculation result: ${mathExpression} = ${result}`
      } catch (error) {
        return `Math error: Unable to evaluate "${input.expression || input.query}"`
      }

    case 'web search':
      const searchQuery = input.query || ''
      return `Web search results for "${searchQuery}": [This would perform a web search - API key required]`

    case 'current time':
      return `Current time: ${new Date().toLocaleString()}`

    case 'weather':
      const location = input.location || input.query || ''
      return `Weather for "${location}": [This would fetch weather data - API key required]`

    case 'url shortener':
      const url = input.url || input.query || ''
      return `Shortened URL for "${url}": [This would create a short URL]`

    case 'password generator':
      const length = Math.min(Math.max(parseInt(input.length || input.query || '12') || 12, 4), 128) // Min 4, max 128
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
      let password = ''
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return `Generated password (${length} characters): ${password}`

    case 'hash calculator':
      const crypto = require('crypto')
      const text = input.text || input.query || ''
      const hash = crypto.createHash('sha256').update(text).digest('hex')
      return `SHA256 hash of "${text}": ${hash}`

    default:
      const fallbackInput = input.query || input.text || input.input || JSON.stringify(input)
      return `Built-in tool "${tool.name}" executed with input: ${fallbackInput}. [Tool implementation needed]`
  }
}

// Helper function to search for relevant documents
async function getRelevantDocuments(query: string, folderId?: string) {
  try {
    const searchConfig = getSearchConfig()
    const results = await searchSimilarChunks(query, searchConfig.topK, undefined, 
      folderId ? { folderId: { $eq: folderId } } : undefined
    )
    
    // Use configured similarity threshold
    return results.filter(result => result.score > searchConfig.similarityThreshold)
  } catch (error) {
    console.warn("Document search failed:", error)
    return []
  }
}

// Helper function to build enhanced system prompt with document context
function buildEnhancedSystemPrompt(
  originalSystemPrompt: string | undefined,
  documentResults: any[]
): string {
  let enhancedPrompt = originalSystemPrompt || "You are a helpful AI assistant."
  
  if (documentResults.length > 0) {
    const documentContext = documentResults
      .map((result, index) => {
        return `Document ${index + 1} (${result.metadata.originalName}, chunk ${result.metadata.chunkIndex + 1}/${result.metadata.totalChunks}):\n${result.content}`
      })
      .join('\n\n---\n\n')
    
    enhancedPrompt += `\n\nYou have access to the following relevant document excerpts to help answer the user's question. Use this information when relevant, and cite the document names when referencing specific information:\n\n${documentContext}\n\nEnd of document context.`
  }
  
  return enhancedPrompt
}

async function callAnthropicAPI(
  messages: ChatMessage[], 
  model: string, 
  systemPrompt?: string,
  temperature: number = 0.7,
  maxTokens: number = 4096,
  tools: Tool[] = []
) {
  // Prepare messages for Anthropic API
  const conversationMessages: Anthropic.Messages.MessageParam[] = []
  
  for (const message of messages) {
    if (message.role !== "system") {
      conversationMessages.push({
        role: message.role,
        content: message.content
      })
    }
  }

  const anthropicTools = tools.length > 0 ? convertToolsToAnthropicFormat(tools) : undefined

  const completion = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt || "You are a helpful AI assistant.",
    messages: conversationMessages,
    temperature,
    ...(anthropicTools && { tools: anthropicTools })
  })

  // Handle different types of content blocks
  let responseText = ""
  
  for (const contentBlock of completion.content) {
    if (contentBlock.type === "text") {
      responseText += contentBlock.text
    } else if (contentBlock.type === "tool_use") {
      // Execute the tool call
      try {
        responseText += `\n\n🔧 **Using ${contentBlock.name} tool...**\n\n`
        const toolInput = contentBlock.input || {}
        const toolResult = await executeToolCall(contentBlock, toolInput, tools)
        responseText += `**Tool Result:** ${toolResult}\n\n`
      } catch (error) {
        console.error('Non-streaming tool execution error:', error)
        responseText += `**Tool Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n`
      }
    }
  }

  return {
    content: responseText,
    model,
    usage: completion.usage
  }
}

async function* callAnthropicStreamingAPI(
  messages: ChatMessage[], 
  model: string, 
  systemPrompt?: string,
  temperature: number = 0.7,
  maxTokens: number = 4096,
  tools: Tool[] = []
) {
  // Prepare messages for Anthropic API
  const conversationMessages: Anthropic.Messages.MessageParam[] = []
  
  for (const message of messages) {
    if (message.role !== "system") {
      conversationMessages.push({
        role: message.role,
        content: message.content
      })
    }
  }

  const anthropicTools = tools.length > 0 ? convertToolsToAnthropicFormat(tools) : undefined

  // Track tool use for follow-up
  let toolUseBlocks: any[] = []
  let toolResults: any[] = []

  const stream = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt || "You are a helpful AI assistant.",
    messages: conversationMessages,
    temperature,
    stream: true,
    ...(anthropicTools && { tools: anthropicTools })
  })

  let currentToolUse: any = null
  let accumulatedToolInput = ""

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_start') {
      if (chunk.content_block.type === 'tool_use') {
        currentToolUse = chunk.content_block
        accumulatedToolInput = ""
        // Send tool call start event
        yield JSON.stringify({
          type: 'tool_call_start',
          data: {
            id: currentToolUse.id,
            name: currentToolUse.name,
            status: 'calling'
          }
        }) + '\n'
      }
    } else if (chunk.type === 'content_block_delta') {
      if (chunk.delta.type === 'text_delta') {
        yield JSON.stringify({
          type: 'content',
          data: chunk.delta.text
        }) + '\n'
      } else if (chunk.delta.type === 'input_json_delta' && currentToolUse) {
        accumulatedToolInput += chunk.delta.partial_json
      }
    } else if (chunk.type === 'content_block_stop' && currentToolUse) {
      // Tool use complete, execute it
      try {
        let toolInput = {}
        
        // Try to parse the accumulated input, with fallback for empty/invalid JSON
        if (accumulatedToolInput.trim()) {
          try {
            toolInput = JSON.parse(accumulatedToolInput)
          } catch (parseError) {
            console.error('JSON parse error for tool input:', accumulatedToolInput)
            // If JSON parsing fails, create a basic object with the raw input
            toolInput = { query: accumulatedToolInput }
          }
        }
        
        // Send tool call input event
        yield JSON.stringify({
          type: 'tool_call_input',
          data: {
            id: currentToolUse.id,
            input: toolInput
          }
        }) + '\n'
        
        const toolResult = await executeToolCall(currentToolUse, toolInput, tools)
        
        // Store tool use and result for follow-up
        toolUseBlocks.push({
          type: "tool_use",
          id: currentToolUse.id,
          name: currentToolUse.name,
          input: toolInput
        })
        
        toolResults.push({
          type: "tool_result",
          tool_use_id: currentToolUse.id,
          content: toolResult
        })
        
        // Send tool call success event
        yield JSON.stringify({
          type: 'tool_call_success',
          data: {
            id: currentToolUse.id,
            output: toolResult
          }
        }) + '\n'
      } catch (error) {
        console.error('Tool execution error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // Store error as tool result
        if (currentToolUse) {
          toolResults.push({
            type: "tool_result", 
            tool_use_id: currentToolUse.id,
            content: `Error: ${errorMessage}`,
            is_error: true
          })
        }
        
        // Send tool call error event
        yield JSON.stringify({
          type: 'tool_call_error',
          data: {
            id: currentToolUse.id,
            error: errorMessage
          }
        }) + '\n'
      }
      currentToolUse = null
      accumulatedToolInput = ""
    }
  }

  // If we have tool results, make a follow-up call for the AI to process them
  if (toolResults.length > 0) {
    console.log(`Found ${toolResults.length} tool results, making follow-up call`)
    
    try {
      // Create follow-up messages with tool results in correct Anthropic format
      const followUpMessages: Anthropic.Messages.MessageParam[] = [
        ...conversationMessages,
        {
          role: "assistant",
          content: toolUseBlocks
        },
        {
          role: "user", 
          content: toolResults
        }
      ]

      console.log('Making follow-up call with tool results:', {
        toolUseBlocks: toolUseBlocks.length,
        toolResults: toolResults.length,
        messagesLength: followUpMessages.length
      })
      
      const followUpStream = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt || "You are a helpful AI assistant. Please analyze and summarize the tool results to provide a comprehensive answer to the user's question.",
        messages: followUpMessages,
        temperature,
        stream: true
      })

      console.log('Follow-up stream started successfully')
      let chunkCount = 0
      
      for await (const chunk of followUpStream) {
        chunkCount++
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield JSON.stringify({
            type: 'content',
            data: chunk.delta.text
          }) + '\n'
        }
      }
      
      console.log(`Follow-up stream completed with ${chunkCount} chunks`)
    } catch (error) {
      console.error('Follow-up API call failed:', error)
      yield JSON.stringify({
        type: 'content',
        data: `\n\n*Note: Could not process tool results for a more detailed response. Error: ${error instanceof Error ? error.message : 'Unknown error'}*`
      }) + '\n'
    }
  }
}

async function callOpenAIAPI(
  messages: ChatMessage[], 
  model: string, 
  systemPrompt?: string,
  temperature: number = 0.7,
  maxTokens: number = 4096
) {
  // For now, return an error since OpenAI integration isn't set up yet
  // You would need to install openai package and set up the client
  throw new Error("OpenAI integration not yet implemented. Please use an Anthropic model for now.")
  
  /*
  // Future implementation would look like:
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })

  const completion = await openai.chat.completions.create({
    model,
    messages: systemPrompt ? 
      [{ role: "system", content: systemPrompt }, ...messages] : 
      messages,
    temperature,
    max_tokens: maxTokens,
  })

  return {
    content: completion.choices[0].message.content,
    model,
    usage: completion.usage
  }
  */
}

// Helper function to associate tools with a conversation
async function associateToolsWithConversation(conversationId: string, toolIds: string[]) {
  if (toolIds.length === 0) return

  try {
    // First, verify the conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })
    
    if (!conversation) {
      console.error(`Conversation ${conversationId} not found`)
      return
    }

    // Verify all tools exist
    const existingTools = await prisma.tool.findMany({
      where: { id: { in: toolIds } }
    })
    
    const foundToolIds = existingTools.map(tool => tool.id)
    const missingToolIds = toolIds.filter(id => !foundToolIds.includes(id))
    
    if (missingToolIds.length > 0) {
      console.error(`Tools not found: ${missingToolIds.join(', ')}`)
    }
    
    // Only connect tools that actually exist
    if (foundToolIds.length > 0) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          tools: {
            connect: foundToolIds.map(id => ({ id }))
          }
        }
      })
      console.log(`Associated ${foundToolIds.length} tools with conversation ${conversationId}`)
    }
  } catch (error) {
    console.error("Error associating tools with conversation:", error)
    // Don't throw - this is not critical for the conversation to continue
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      messages, 
      model: modelId, 
      systemPrompt, 
      folderId, 
      stream = true,
      temperature = 0.7,
      maxTokens = 4096,
      tools = [],
      conversationId
    } = await request.json()

    // Get model information
    const modelInfo = getModelById(modelId)
    if (!modelInfo) {
      return NextResponse.json(
        { error: `Model '${modelId}' not found` }, 
        { status: 400 }
      )
    }

    // Validate and clamp maxTokens to model's actual limit
    const validatedMaxTokens = Math.min(Math.max(maxTokens, 1), modelInfo.maxOutputTokens)
    
    if (maxTokens > modelInfo.maxOutputTokens) {
      console.warn(`maxTokens ${maxTokens} exceeds model limit ${modelInfo.maxOutputTokens}, clamped to ${validatedMaxTokens}`)
    }

    // Check if required API key is available
    if (modelInfo.provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" }, 
        { status: 500 }
      )
    }

    if (modelInfo.provider === 'openai' && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" }, 
        { status: 500 }
      )
    }

    // Get the user's latest message for document search
    const latestUserMessage = messages.filter((msg: ChatMessage) => msg.role === 'user').pop()
    let enhancedSystemPrompt = systemPrompt
    
    // Search for relevant documents if user message exists
    if (latestUserMessage?.content) {
      const relevantDocs = await getRelevantDocuments(latestUserMessage.content, folderId)
      enhancedSystemPrompt = buildEnhancedSystemPrompt(systemPrompt, relevantDocs)
      
      if (relevantDocs.length > 0) {
        console.log(`Found ${relevantDocs.length} relevant document chunks for query`)
      }
    }

    // Associate tools with conversation if provided
    if (conversationId && tools.length > 0) {
      const toolIds = tools.map((tool: Tool) => tool.id)
      await associateToolsWithConversation(conversationId, toolIds)
    }

    // Handle streaming vs non-streaming
    if (stream && modelInfo.provider === 'anthropic') {
      // Return streaming response
      const encoder = new TextEncoder()
      
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of callAnthropicStreamingAPI(
              messages, 
              modelId, 
              enhancedSystemPrompt, 
              temperature, 
              validatedMaxTokens,
              tools
            )) {
              controller.enqueue(encoder.encode(chunk))
            }
            
            // Send final message to indicate completion
            controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'))
            controller.close()
          } catch (error) {
            console.error("Streaming error:", error)
            const errorData = JSON.stringify({ 
              type: 'error',
              data: { message: error instanceof Error ? error.message : "Unknown error" }
            })
            controller.enqueue(encoder.encode(errorData + '\n'))
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Call appropriate API based on provider (non-streaming)
      let result
      if (modelInfo.provider === 'anthropic') {
        result = await callAnthropicAPI(messages, modelId, enhancedSystemPrompt, temperature, validatedMaxTokens, tools)
      } else if (modelInfo.provider === 'openai') {
        result = await callOpenAIAPI(messages, modelId, enhancedSystemPrompt, temperature, validatedMaxTokens)
      } else {
        return NextResponse.json(
          { error: `Unsupported provider: ${modelInfo.provider}` }, 
          { status: 400 }
        )
      }

      return NextResponse.json(result)
    }

  } catch (error) {
    console.error("Error calling AI API:", error)
    
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API Error: ${error.message}` }, 
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to generate AI response" }, 
      { status: 500 }
    )
  }
} 