import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateConversationTitle } from "@/lib/conversation-naming"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify conversation belongs to user and get its messages
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 3 // Get first few messages for title generation
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    if (conversation.messages.length === 0) {
      return NextResponse.json({ error: "Cannot generate title for conversation with no messages" }, { status: 400 })
    }

    // Use the first user message or first message if no user message exists
    const firstUserMessage = conversation.messages.find(msg => msg.role === 'USER')
    const messageToAnalyze = firstUserMessage || conversation.messages[0]

    // Generate new title
    const newTitle = await generateConversationTitle(
      messageToAnalyze.content, 
      messageToAnalyze.role.toLowerCase() as 'user' | 'assistant'
    )

    // Update the conversation title
    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: { title: newTitle },
      select: {
        id: true,
        title: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      title: newTitle,
      conversation: updatedConversation
    })

  } catch (error) {
    console.error("Error generating conversation title:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 