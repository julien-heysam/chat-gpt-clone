import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: "desc"
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

    // Transform the data to match the FolderItem interface
    const transformedFolders = folders.map((folder: {
      id: string;
      name: string;
      systemPrompt: string | null;
      _count: {
        conversations: number;
      };
    }) => ({
      id: folder.id,
      name: folder.name,
      systemPrompt: folder.systemPrompt,
      conversationCount: folder._count.conversations
    }))

    return NextResponse.json(transformedFolders)
  } catch (error) {
    console.error("Error fetching folders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, systemPrompt } = await request.json()

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        systemPrompt: systemPrompt || null,
        userId: session.user.id
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
      id: folder.id,
      name: folder.name,
      systemPrompt: folder.systemPrompt,
      conversationCount: folder._count.conversations
    })
  } catch (error) {
    console.error("Error creating folder:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 