import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { searchSimilarChunks } from "@/lib/document-processing"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { query, folderId, topK = 5 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Build filter for folder-specific search if folderId is provided
    let filter: Record<string, any> | undefined
    if (folderId) {
      filter = {
        folderId: { $eq: folderId }
      }
    }

    try {
      const results = await searchSimilarChunks(query, topK, 'documents', filter)
      
      return NextResponse.json({
        query,
        results,
        count: results.length,
        folderId: folderId || null
      })
    } catch (error) {
      console.error("Error searching documents:", error)
      
      // If vector search fails, return empty results instead of erroring
      return NextResponse.json({
        query,
        results: [],
        count: 0,
        folderId: folderId || null,
        message: "Document search temporarily unavailable. Please ensure Pinecone is configured."
      })
    }
  } catch (error) {
    console.error("Error in document search:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 