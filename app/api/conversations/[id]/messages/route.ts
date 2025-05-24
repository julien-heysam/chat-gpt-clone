import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { estimateTokenCount, calculateCost } from "@/lib/models"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, role, model, latency, inputTokens, outputTokens } = await request.json()
    const { id } = await params

    // Verify the conversation belongs to the user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.user.id
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
          where: { conversationId: id },
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
        conversationId: id
      }
    })

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: {
        id
      },
      data: {
        updatedAt: new Date()
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 