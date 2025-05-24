import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { processDocument } from "@/lib/document-processing"
import { getFileConfig } from "@/lib/document-config"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: folderId } = await params

    // Verify folder belongs to user
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: session.user.id
      }
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Get file configuration
    const fileConfig = getFileConfig()

    // Validate file size using configuration
    if (file.size > fileConfig.maxSize) {
      const maxSizeMB = Math.round(fileConfig.maxSize / 1024 / 1024)
      return NextResponse.json({ 
        error: `File size must be less than ${maxSizeMB}MB` 
      }, { status: 400 })
    }

    // Validate file type using configuration
    if (!fileConfig.supportedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "File type not supported. Please upload PDF, DOCX, TXT, MD, CSV, XLS, XLSX, PPT, or PPTX files." 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const uniqueFilename = `${uuidv4()}${fileExtension}`
    const filePath = path.join("public", "uploads", uniqueFilename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await fs.writeFile(filePath, buffer)

    // Save document record to database
    const document = await prisma.document.create({
      data: {
        filename: uniqueFilename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: filePath,
        folderId,
        userId: session.user.id
      }
    })

    // Process document for vector indexing (run in background)
    // Don't await this to avoid blocking the response
    processDocumentInBackground(document.id, filePath, uniqueFilename, file.name, file.type, folderId)

    return NextResponse.json({
      ...document,
      processing: true,
      message: "Document uploaded successfully. Processing for search capabilities..."
    })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Background processing function
async function processDocumentInBackground(
  documentId: string,
  filePath: string,
  filename: string,
  originalName: string,
  mimeType: string,
  folderId: string
) {
  try {
    console.log(`Starting background processing for document: ${originalName}`)
    
    const result = await processDocument(documentId, filePath, filename, originalName, mimeType, folderId)
    
    if (result.success) {
      console.log(`Successfully processed document ${originalName} - ${result.chunksCount} chunks created`)
      
      // Optionally update document status in database
      await prisma.document.update({
        where: { id: documentId },
        data: {
          // You could add a status field to track processing completion
          updatedAt: new Date()
        }
      })
    } else {
      console.error(`Failed to process document ${originalName}`)
    }
  } catch (error) {
    console.error(`Error in background processing for ${originalName}:`, error)
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

    const { id: folderId } = await params

    // Verify folder belongs to user and get documents
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: session.user.id
      },
      include: {
        documents: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    return NextResponse.json(folder.documents)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 