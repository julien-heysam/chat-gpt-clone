import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: conversationId, messageId } = await params

    // Verify the conversation belongs to the user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Get the message to be deleted and verify it belongs to this conversation
    const messageToDelete = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversationId: conversationId
      }
    })

    if (!messageToDelete) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Get all messages in the conversation ordered by creation time
    const allMessages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Find the index of the message to delete
    const messageIndex = allMessages.findIndex(msg => msg.id === messageId)
    
    if (messageIndex === -1) {
      return NextResponse.json({ error: "Message not found in conversation" }, { status: 404 })
    }

    // Get all messages from this point onwards (including the message itself)
    const messagesToDelete = allMessages.slice(messageIndex)
    const messageIdsToDelete = messagesToDelete.map(msg => msg.id)

    // Delete all messages from this point onwards
    const deleteResult = await prisma.message.deleteMany({
      where: {
        id: {
          in: messageIdsToDelete
        }
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

    return NextResponse.json({ 
      success: true, 
      deletedCount: deleteResult.count,
      deletedMessageIds: messageIdsToDelete
    })
  } catch (error) {
    console.error("Error deleting messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 