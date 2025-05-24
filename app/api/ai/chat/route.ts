import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getModelById } from "@/lib/models"
import { searchSimilarChunks } from "@/lib/document-processing"
import { getSearchConfig } from "@/lib/document-config"
import Anthropic from "@anthropic-ai/sdk"

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
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
  maxTokens: number = 4096
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

  const completion = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt || "You are a helpful AI assistant.",
    messages: conversationMessages,
    temperature,
  })

  const responseContent = completion.content[0]
  if (responseContent.type !== "text") {
    throw new Error("Unexpected response type from Anthropic API")
  }

  return {
    content: responseContent.text,
    model,
    usage: completion.usage
  }
}

async function* callAnthropicStreamingAPI(
  messages: ChatMessage[], 
  model: string, 
  systemPrompt?: string,
  temperature: number = 0.7,
  maxTokens: number = 4096
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

  const stream = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt || "You are a helpful AI assistant.",
    messages: conversationMessages,
    temperature,
    stream: true,
  })

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text
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
      maxTokens = 4096
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
              validatedMaxTokens
            )) {
              const data = JSON.stringify({ content: chunk, model: modelId })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
            
            // Send final message to indicate completion
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            controller.close()
          } catch (error) {
            console.error("Streaming error:", error)
            const errorData = JSON.stringify({ 
              error: error instanceof Error ? error.message : "Unknown error" 
            })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
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
        result = await callAnthropicAPI(messages, modelId, enhancedSystemPrompt, temperature, validatedMaxTokens)
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