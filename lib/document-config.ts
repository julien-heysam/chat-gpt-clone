// Document Processing Configuration
// This file centralizes all document processing settings for easy management

export interface DocumentConfig {
  // Vector Database Settings
  pinecone: {
    indexName: string
    batchSize: number
  }
  
  // Embedding Settings
  embedding: {
    model: string
    dimensions: number
  }
  
  // Text Processing Settings
  chunking: {
    chunkSize: number
    overlap: number
  }
  
  // Search Settings
  search: {
    topK: number
    similarityThreshold: number
  }
  
  // File Processing Settings
  files: {
    maxSize: number // in bytes
    supportedTypes: string[]
  }
}

// Default configuration - can be overridden by environment variables or database settings
export const DEFAULT_CONFIG: DocumentConfig = {
  pinecone: {
    indexName: process.env.PINECONE_INDEX_NAME || 'documents',
    batchSize: parseInt(process.env.PINECONE_BATCH_SIZE || '100')
  },
  
  embedding: {
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1536')
  },
  
  chunking: {
    chunkSize: parseInt(process.env.CHUNK_SIZE || '1000'),
    overlap: parseInt(process.env.CHUNK_OVERLAP || '200')
  },
  
  search: {
    topK: parseInt(process.env.SEARCH_TOP_K || '5'),
    similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.7')
  },
  
  files: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    supportedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  }
}

// Function to get current configuration
export const getDocumentConfig = (): DocumentConfig => {
  // In the future, this could fetch from database or user settings
  // For now, return the default config with environment variable overrides
  return DEFAULT_CONFIG
}

// Helper function to get specific config sections
export const getPineconeConfig = () => getDocumentConfig().pinecone
export const getEmbeddingConfig = () => getDocumentConfig().embedding
export const getChunkingConfig = () => getDocumentConfig().chunking
export const getSearchConfig = () => getDocumentConfig().search
export const getFileConfig = () => getDocumentConfig().files

// Function to validate configuration
export const validateConfig = (config: DocumentConfig): string[] => {
  const errors: string[] = []
  
  if (!config.pinecone.indexName) {
    errors.push('Pinecone index name is required')
  }
  
  if (config.embedding.dimensions <= 0) {
    errors.push('Embedding dimensions must be positive')
  }
  
  if (config.chunking.chunkSize <= 0) {
    errors.push('Chunk size must be positive')
  }
  
  if (config.chunking.overlap >= config.chunking.chunkSize) {
    errors.push('Chunk overlap must be less than chunk size')
  }
  
  if (config.search.similarityThreshold < 0 || config.search.similarityThreshold > 1) {
    errors.push('Similarity threshold must be between 0 and 1')
  }
  
  return errors
}

// Export current config for debugging
export const logCurrentConfig = () => {
  const config = getDocumentConfig()
  const errors = validateConfig(config)
  
  console.log('📋 Document Processing Configuration:')
  console.log('🔗 Pinecone Index:', config.pinecone.indexName)
  console.log('🧠 Embedding Model:', config.embedding.model)
  console.log('📝 Chunk Size:', config.chunking.chunkSize, 'words')
  console.log('🔍 Search Top K:', config.search.topK)
  console.log('📊 Similarity Threshold:', config.search.similarityThreshold)
  console.log('💾 Max File Size:', Math.round(config.files.maxSize / 1024 / 1024), 'MB')
  
  if (errors.length > 0) {
    console.warn('⚠️ Configuration Errors:', errors)
  }
  
  return { config, errors }
} 