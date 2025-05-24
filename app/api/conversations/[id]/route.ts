import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        folder: true
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Calculate total cost and token usage
    const totalCost = conversation.messages.reduce((sum, message) => {
      return sum + (message.cost || 0)
    }, 0)

    const totalTokens = conversation.messages.reduce((sum, message) => {
      return sum + (message.inputTokens || 0) + (message.outputTokens || 0)
    }, 0)

    return NextResponse.json({
      ...conversation,
      totalCost,
      totalTokens
    })
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { folderId, title } = await request.json()
    const { id } = await params

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // If folderId is provided, verify folder belongs to user
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: session.user.id
        }
      })

      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 })
      }
    }

    const updatedConversation = await prisma.conversation.update({
      where: {
        id
      },
      data: {
        ...(folderId !== undefined && { folderId }),
        ...(title && { title })
      },
      select: {
        id: true,
        title: true,
        folderId: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    return NextResponse.json(updatedConversation)
  } catch (error) {
    console.error("Error updating conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ DELETE request received for conversation')
    
    const session = await getServerSession(authOptions)
    console.log('👤 Session check:', session ? `User: ${session.user?.id}` : 'No session')
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized: No valid session')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    console.log('🔍 Attempting to delete conversation:', id)

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!conversation) {
      console.log('❌ Conversation not found or access denied')
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    console.log('🗑️ Deleting conversation from database...')
    await prisma.conversation.delete({
      where: {
        id
      }
    })

    console.log('✅ Conversation deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error deleting conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 