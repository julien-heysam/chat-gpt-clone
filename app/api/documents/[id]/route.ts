import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { promises as fs } from "fs"
import { deleteDocumentFromIndex } from "@/lib/document-processing"

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

    // Find document and verify ownership
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.path)
    } catch (error) {
      console.warn("Failed to delete file from filesystem:", error)
      // Continue with database deletion even if file removal fails
    }

    // Delete document embeddings from vector index
    try {
      await deleteDocumentFromIndex(document.id)
      console.log(`Successfully deleted embeddings for document ${document.originalName}`)
    } catch (error) {
      console.warn("Failed to delete document from vector index:", error)
      // Continue with database deletion even if vector deletion fails
    }

    // Delete document record from database
    await prisma.document.delete({
      where: {
        id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Find document and verify ownership
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        folder: true
      }
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 