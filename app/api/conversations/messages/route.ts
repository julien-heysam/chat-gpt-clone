import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { estimateTokenCount, calculateCost } from "@/lib/models"
import { generateConversationTitle } from "@/lib/conversation-naming"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId, content, role, model, latency, inputTokens, outputTokens, toolCalls, thinkingContent } = await request.json()

    console.log(`Saving message with thinking content: ${thinkingContent ? thinkingContent.length + ' chars' : 'none'}`)

    // Verify the conversation belongs to the user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Calculate token usage and cost
    let finalInputTokens = inputTokens
    let finalOutputTokens = outputTokens
    let cost = 0

    if (role.toUpperCase() === "ASSISTANT") {
      // For assistant messages, use provided tokens or estimate output tokens
      finalOutputTokens = outputTokens || estimateTokenCount(content)
      
      // If we have input tokens, use them; otherwise estimate from conversation history
      if (!finalInputTokens) {
        // Get recent messages to estimate input context
        const recentMessages = await prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          take: 10 // Last 10 messages for context estimation
        })
        
        const contextText = recentMessages
          .reverse()
          .map(msg => msg.content)
          .join(' ')
        
        finalInputTokens = estimateTokenCount(contextText)
      }
      
      cost = calculateCost(finalInputTokens, finalOutputTokens, model || "claude-4-sonnet")
    } else if (role.toUpperCase() === "USER") {
      // For user messages, only count as input tokens
      finalInputTokens = estimateTokenCount(content)
      finalOutputTokens = 0
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        role: role.toUpperCase(),
        model: model || "claude-4-sonnet",
        ...(latency && { latency }),
        ...(finalInputTokens && { inputTokens: finalInputTokens }),
        ...(finalOutputTokens && { outputTokens: finalOutputTokens }),
        ...(cost > 0 && { cost }),
        ...(toolCalls && { toolCalls }),
        ...(thinkingContent && { thinkingContent }),
        conversationId
      }
    })

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        updatedAt: new Date()
      }
    })

    // Auto-generate conversation title if this is the first message or if the conversation still has the default title
    const isFirstMessage = conversation._count.messages === 0
    const hasDefaultTitle = conversation.title === "New Conversation" || conversation.title.startsWith("New Conversation")
    
    if (isFirstMessage || hasDefaultTitle) {
      try {
        // Generate title based on the message content
        const generatedTitle = await generateConversationTitle(content, role as 'user' | 'assistant')
        
        // Update the conversation title in the background (don't block the response)
        prisma.conversation.update({
          where: { id: conversationId },
          data: { title: generatedTitle }
        }).catch(error => {
          console.error('Error updating conversation title:', error)
        })
        
        console.log(`Auto-generated title for conversation ${conversationId}: "${generatedTitle}"`)
      } catch (error) {
        console.error('Error generating conversation title:', error)
        // Title generation failure shouldn't block message creation
      }
    }

    // Return message in the format expected by the frontend
    return NextResponse.json({
      id: message.id,
      content: message.content,
      role: message.role.toLowerCase(),
      model: message.model,
      latency: message.latency,
      inputTokens: message.inputTokens,
      outputTokens: message.outputTokens,
      cost: message.cost,
      createdAt: message.createdAt,
      thinkingContent: message.thinkingContent,
      toolCalls: message.toolCalls ? JSON.parse(JSON.stringify(message.toolCalls)) : undefined
    })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 