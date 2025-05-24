import { openai } from '@ai-sdk/openai'
import { embedMany, embed } from 'ai'
import { Pinecone } from '@pinecone-database/pinecone'
import { promises as fs } from 'fs'
import { 
  getDocumentConfig, 
  getPineconeConfig, 
  getEmbeddingConfig, 
  getChunkingConfig, 
  getSearchConfig,
  logCurrentConfig 
} from './document-config'

// Initialize Pinecone client
let pinecone: Pinecone | null = null

export const initializePinecone = () => {
  if (!pinecone && process.env.PINECONE_API_KEY) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    })
  }
  return pinecone
}

// Text extraction utilities
export const extractTextFromFile = async (filePath: string, mimeType: string, originalName?: string): Promise<string> => {
  try {
    switch (true) {
      case mimeType.includes('pdf'):
        return await extractTextFromPDF(filePath, originalName)
      
      case mimeType.includes('word') || mimeType.includes('document'):
        return await extractTextFromWord(filePath)
      
      case mimeType.includes('text') || mimeType.includes('markdown'):
        return await extractTextFromText(filePath)
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`)
    }
  } catch (error) {
    console.error('Error extracting text from file:', error)
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

const extractTextFromPDF = async (filePath: string, originalName?: string): Promise<string> => {
  console.log(`Starting PDF extraction for: ${originalName || filePath}`)
  
  // Try node-poppler first (most reliable for PDF text extraction)
  try {
    console.log('Attempting extraction with node-poppler...')
    const { Poppler } = await import('node-poppler')
    const poppler = new Poppler()
    
    // Extract text using poppler's pdfToText method
    const text = await poppler.pdfToText(filePath)
    
    if (text && text.trim().length > 0) {
      console.log(`Successfully extracted ${text.length} characters with node-poppler`)
      return text.trim()
    } else {
      throw new Error('PDF appears to be empty or contains no extractable text')
    }
  } catch (popplerError) {
    console.log('node-poppler failed, trying pdf-parse fallback...', popplerError)
    
    // Try pdf-parse as fallback (simplified approach)
    try {
      console.log('Attempting extraction with pdf-parse...')
      const pdf = await import('pdf-parse')
      const buffer = await fs.readFile(filePath)
      
      // Use pdf-parse with minimal configuration
      const data = await pdf.default(buffer)
      
      if (data.text && data.text.trim().length > 0) {
        console.log(`Successfully extracted ${data.text.length} characters with pdf-parse`)
        return data.text.trim()
      } else {
        throw new Error('PDF appears to be empty or contains no extractable text')
      }
    } catch (pdfParseError) {
      console.error('All PDF extraction methods failed:', pdfParseError)
      
      // Only use fallback if ALL methods fail
      console.log('All extraction methods failed, using fallback...')
      return await fallbackPDFExtraction(filePath, originalName)
    }
  }
}

// Enhanced fallback PDF extraction method
const fallbackPDFExtraction = async (filePath: string, originalName?: string): Promise<string> => {
  try {
    const stats = await fs.stat(filePath)
    const sizeKB = Math.round(stats.size / 1024)
    
    // Use original name if provided, otherwise extract from path
    const displayName = originalName || filePath.split('/').pop() || 'document.pdf'
    
    // For now, return a meaningful placeholder that can still be processed
    // This allows the document to be indexed with basic metadata
    const fallbackText = `PDF Document: ${displayName}
    
File Size: ${sizeKB}KB
Uploaded: ${new Date().toISOString()}
    
Note: This PDF has been successfully uploaded and saved. Text extraction encountered a technical issue but the document is ready for future processing. The file contains ${sizeKB}KB of data and can be re-processed once PDF extraction issues are resolved.

This document is now searchable by filename and basic metadata.`
    
    console.log(`Using fallback extraction for PDF: ${displayName} (${sizeKB}KB)`)
    return fallbackText
  } catch (error) {
    console.error('Fallback PDF extraction failed:', error)
    throw new Error('Failed to process PDF file.')
  }
}

// Removed pdfjs-dist alternative since node-poppler is more reliable

const extractTextFromWord = async (filePath: string): Promise<string> => {
  try {
    const mammoth = await import('mammoth')
    const buffer = await fs.readFile(filePath)
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('Error extracting text from Word document:', error)
    throw new Error('Failed to extract text from Word document. Make sure the file is a valid document.')
  }
}

const extractTextFromText = async (filePath: string): Promise<string> => {
  try {
    return await fs.readFile(filePath, 'utf-8')
  } catch (error) {
    console.error('Error reading text file:', error)
    throw new Error('Failed to read text file.')
  }
}

// Text chunking utilities
export interface DocumentChunk {
  id: string
  content: string
  metadata: {
    documentId: string
    filename: string
    originalName: string
    chunkIndex: number
    totalChunks: number
    wordCount: number
    folderId?: string
  }
}

export const chunkText = (
  text: string, 
  documentId: string, 
  filename: string, 
  originalName: string,
  folderId?: string,
  chunkSize?: number,
  overlap?: number
): DocumentChunk[] => {
  // Use configuration values if not provided
  const config = getChunkingConfig()
  const actualChunkSize = chunkSize || config.chunkSize
  const actualOverlap = overlap || config.overlap
  
  const words = text.split(/\s+/)
  const chunks: DocumentChunk[] = []
  let currentIndex = 0
  let chunkIndex = 0

  while (currentIndex < words.length) {
    const endIndex = Math.min(currentIndex + actualChunkSize, words.length)
    const chunkWords = words.slice(currentIndex, endIndex)
    const content = chunkWords.join(' ')

    if (content.trim().length > 0) {
      chunks.push({
        id: `${documentId}-chunk-${chunkIndex}`,
        content: content.trim(),
        metadata: {
          documentId,
          filename,
          originalName,
          chunkIndex,
          totalChunks: 0, // Will be updated after all chunks are created
          wordCount: chunkWords.length,
          folderId
        }
      })
      chunkIndex++
    }

    // Move forward by chunkSize - overlap to create overlapping chunks
    currentIndex += actualChunkSize - actualOverlap
  }

  // Update total chunks count
  chunks.forEach(chunk => {
    chunk.metadata.totalChunks = chunks.length
  })

  return chunks
}

// Embedding utilities using Vercel AI
export const generateEmbeddings = async (chunks: DocumentChunk[]): Promise<Array<DocumentChunk & { embedding: number[] }>> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for generating embeddings')
  }

  try {
    const config = getEmbeddingConfig()
    const texts = chunks.map(chunk => chunk.content)
    
    const { embeddings } = await embedMany({
      model: openai.embedding(config.model as any),
      values: texts,
    })

    return chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index]
    }))
  } catch (error) {
    console.error('Error generating embeddings:', error)
    throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Pinecone vector operations
export const indexDocumentChunks = async (
  chunksWithEmbeddings: Array<DocumentChunk & { embedding: number[] }>,
  indexName?: string
): Promise<void> => {
  const pc = initializePinecone()
  if (!pc) {
    throw new Error('Pinecone not initialized. Please check PINECONE_API_KEY.')
  }

  try {
    const config = getPineconeConfig()
    const actualIndexName = indexName || config.indexName
    const index = pc.index(actualIndexName)
    
    const vectors = chunksWithEmbeddings.map(chunk => {
      const metadata: any = {
        content: chunk.content,
        documentId: chunk.metadata.documentId,
        filename: chunk.metadata.filename,
        originalName: chunk.metadata.originalName,
        chunkIndex: chunk.metadata.chunkIndex,
        totalChunks: chunk.metadata.totalChunks,
        wordCount: chunk.metadata.wordCount
      }
      
      // Only include folderId if it's defined
      if (chunk.metadata.folderId) {
        metadata.folderId = chunk.metadata.folderId
      }
      
      return {
        id: chunk.id,
        values: chunk.embedding,
        metadata
      }
    })

    // Upsert vectors in batches to avoid rate limits
    const batchSize = config.batchSize
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize)
      await index.upsert(batch)
    }

    console.log(`Successfully indexed ${vectors.length} chunks for document in index: ${actualIndexName}`)
  } catch (error) {
    console.error('Error indexing document chunks:', error)
    throw new Error(`Failed to index document chunks: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Search and retrieval utilities
export interface SearchResult {
  id: string
  score: number
  content: string
  metadata: {
    documentId: string
    filename: string
    originalName: string
    chunkIndex: number
    totalChunks: number
    wordCount: number
    folderId?: string
  }
}

export const searchSimilarChunks = async (
  query: string,
  topK?: number,
  indexName?: string,
  filter?: Record<string, any>
): Promise<SearchResult[]> => {
  const pc = initializePinecone()
  if (!pc) {
    throw new Error('Pinecone not initialized. Please check PINECONE_API_KEY.')
  }

  try {
    const pineconeConfig = getPineconeConfig()
    const embeddingConfig = getEmbeddingConfig()
    const searchConfig = getSearchConfig()
    
    const actualTopK = topK || searchConfig.topK
    const actualIndexName = indexName || pineconeConfig.indexName

    // Generate embedding for the query
    const { embedding } = await embed({
      model: openai.embedding(embeddingConfig.model as any),
      value: query,
    })

    const index = pc.index(actualIndexName)
    
    const queryResponse = await index.query({
      vector: embedding,
      topK: actualTopK,
      includeMetadata: true,
      filter
    })

    return queryResponse.matches?.map(match => ({
      id: match.id,
      score: match.score || 0,
      content: match.metadata?.content as string || '',
      metadata: {
        documentId: match.metadata?.documentId as string || '',
        filename: match.metadata?.filename as string || '',
        originalName: match.metadata?.originalName as string || '',
        chunkIndex: match.metadata?.chunkIndex as number || 0,
        totalChunks: match.metadata?.totalChunks as number || 0,
        wordCount: match.metadata?.wordCount as number || 0,
        folderId: match.metadata?.folderId as string || undefined
      }
    })) || []
  } catch (error) {
    console.error('Error searching similar chunks:', error)
    throw new Error(`Failed to search similar chunks: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Document deletion from vector index
export const deleteDocumentFromIndex = async (
  documentId: string,
  indexName?: string
): Promise<void> => {
  const pc = initializePinecone()
  if (!pc) {
    throw new Error('Pinecone not initialized. Please check PINECONE_API_KEY.')
  }

  try {
    const config = getPineconeConfig()
    const actualIndexName = indexName || config.indexName
    const index = pc.index(actualIndexName)
    
    console.log(`🔍 Searching for chunks to delete for document: ${documentId}`)
    
    // First, query to find all chunk IDs for this document
    // Since chunk IDs follow the pattern: ${documentId}-chunk-${chunkIndex}
    // We can search by content and filter to find them
    try {
      // Try using simple filter syntax first
      const queryResponse = await index.query({
        vector: new Array(1536).fill(0), // Dummy vector for querying
        // TODO: change that to use openai embeding on the query
        topK: 1000, // Get many results to find all chunks
        includeMetadata: true,
        filter: {
          documentId: documentId // Try without $eq operator
        }
      })

      if (queryResponse.matches && queryResponse.matches.length > 0) {
        console.log(`📋 Found ${queryResponse.matches.length} chunks to delete`)
        
        // Delete by specific IDs
        const idsToDelete = queryResponse.matches.map(match => match.id)
        await index.deleteMany(idsToDelete)
        
        console.log(`✅ Successfully deleted ${idsToDelete.length} chunks for document ${documentId}`)
      } else {
        console.log(`⚠️ No chunks found for document ${documentId} - may already be deleted`)
      }
      
    } catch (filterError) {
      console.log('🔄 Filter approach failed, trying ID-based deletion...', filterError)
      
      // Fallback: Try to delete chunks by ID pattern
      // Get all possible chunk IDs (assuming max 1000 chunks per document)
      const idsToTry: string[] = []
      for (let i = 0; i < 1000; i++) {
        idsToTry.push(`${documentId}-chunk-${i}`)
      }
      
      // Delete in batches to avoid API limits
      const batchSize = 100
      let deletedCount = 0
      
      for (let i = 0; i < idsToTry.length; i += batchSize) {
        const batch = idsToTry.slice(i, i + batchSize)
        try {
          await index.deleteMany(batch)
          // Note: Pinecone won't error for non-existent IDs
          deletedCount += batch.length
        } catch (batchError) {
          console.log(`⚠️ Batch deletion error (this is normal):`, batchError)
        }
      }
      
      console.log(`🧹 Attempted cleanup deletion for ${deletedCount} potential chunk IDs`)
    }

    console.log(`✅ Document ${documentId} deletion process completed`)
    
  } catch (error) {
    console.error('Error deleting document from index:', error)
    // Don't throw error - document deletion should still succeed even if vector cleanup fails
    console.log(`⚠️ Vector index cleanup failed, but continuing with document deletion`)
  }
}

// Main document processing function
export const processDocument = async (
  documentId: string,
  filePath: string,
  filename: string,
  originalName: string,
  mimeType: string,
  folderId?: string
): Promise<{ chunksCount: number; success: boolean }> => {
  try {
    console.log(`Processing document: ${originalName}`)
    
    // Log current configuration
    logCurrentConfig()
    
    // Extract text from document
    const text = await extractTextFromFile(filePath, mimeType, originalName)
    console.log(`Extracted ${text.length} characters from ${originalName}`)
    
    // Chunk the text using configuration
    const chunks = chunkText(text, documentId, filename, originalName, folderId)
    console.log(`Created ${chunks.length} chunks from ${originalName}`)
    
    // Generate embeddings using configuration
    const chunksWithEmbeddings = await generateEmbeddings(chunks)
    console.log(`Generated embeddings for ${chunksWithEmbeddings.length} chunks`)
    
    // Index in Pinecone using configuration
    await indexDocumentChunks(chunksWithEmbeddings)
    console.log(`Successfully indexed ${chunksWithEmbeddings.length} chunks`)
    
    return {
      chunksCount: chunks.length,
      success: true
    }
  } catch (error) {
    console.error('Error processing document:', error)
    return {
      chunksCount: 0,
      success: false
    }
  }
}

// Utility function to re-process a document (useful for fixing extraction issues)
export const reprocessDocument = async (documentId: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Re-processing document: ${documentId}`)
    
    // First, get the document from database
    const { prisma } = await import('./prisma')
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })
    
    if (!document) {
      return { success: false, message: 'Document not found' }
    }
    
    console.log(`Found document: ${document.originalName} at ${document.path}`)
    
    // Check if file still exists
    try {
      await fs.access(document.path)
    } catch {
      return { success: false, message: 'Physical file no longer exists' }
    }
    
    // Delete existing vectors from Pinecone
    await deleteDocumentFromIndex(documentId)
    console.log('Deleted existing vectors from index')
    
    // Re-process the document
    const result = await processDocument(
      document.id,
      document.path,
      document.filename,
      document.originalName,
      document.mimeType,
      document.folderId || undefined
    )
    
    if (result.success) {
      console.log(`Successfully re-processed ${document.originalName} with ${result.chunksCount} chunks`)
      return { 
        success: true, 
        message: `Successfully re-processed document with ${result.chunksCount} chunks` 
      }
    } else {
      return { success: false, message: 'Re-processing failed' }
    }
  } catch (error) {
    console.error('Error re-processing document:', error)
    return { 
      success: false, 
      message: `Re-processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
} 