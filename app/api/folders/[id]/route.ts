import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, systemPrompt } = await request.json()
    const { id } = await params

    // Verify folder belongs to user
    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    const updatedFolder = await prisma.folder.update({
      where: {
        id
      },
      data: {
        ...(name && { name: name.trim() }),
        ...(systemPrompt !== undefined && { systemPrompt: systemPrompt || null })
      },
      select: {
        id: true,
        name: true,
        systemPrompt: true,
        _count: {
          select: {
            conversations: true
          }
        }
      }
    })

    return NextResponse.json({
      id: updatedFolder.id,
      name: updatedFolder.name,
      systemPrompt: updatedFolder.systemPrompt,
      conversationCount: updatedFolder._count.conversations
    })
  } catch (error) {
    console.error("Error updating folder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify folder belongs to user
    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    await prisma.folder.delete({
      where: {
        id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting folder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 