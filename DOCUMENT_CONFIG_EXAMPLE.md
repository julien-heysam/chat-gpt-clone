# Document Processing Configuration Examples

Add any of these environment variables to your `.env.local` file to customize document processing:

## Vector Database Settings
```bash
# Pinecone index name (default: 'documents')
PINECONE_INDEX_NAME=my-custom-index

# Batch size for vector uploads (default: 100)
PINECONE_BATCH_SIZE=50
```

## Embedding Settings
```bash
# OpenAI embedding model (default: 'text-embedding-3-small')
EMBEDDING_MODEL=text-embedding-ada-002

# Embedding dimensions - must match your Pinecone index! (default: 1536)
EMBEDDING_DIMENSIONS=1536
```

## Text Processing Settings
```bash
# Words per chunk (default: 1000)
CHUNK_SIZE=800

# Word overlap between chunks (default: 200)
CHUNK_OVERLAP=150
```

## Search Settings
```bash
# Number of similar chunks to retrieve (default: 5)
SEARCH_TOP_K=3

# Minimum similarity score to include results (default: 0.7)
SIMILARITY_THRESHOLD=0.8
```

## File Upload Settings
```bash
# Maximum file size in bytes (default: 10485760 = 10MB)
MAX_FILE_SIZE=20971520

# Note: Supported file types are configured in code but can be extended
```

## Quick Start Examples

### Conservative Settings (Smaller chunks, higher quality)
```bash
PINECONE_INDEX_NAME=documents-small
CHUNK_SIZE=500
CHUNK_OVERLAP=100
SIMILARITY_THRESHOLD=0.8
SEARCH_TOP_K=3
```

### Aggressive Settings (Larger chunks, more results)
```bash
PINECONE_INDEX_NAME=documents-large
CHUNK_SIZE=1500
CHUNK_OVERLAP=300
SIMILARITY_THRESHOLD=0.6
SEARCH_TOP_K=8
```

### High-Quality Embeddings
```bash
EMBEDDING_MODEL=text-embedding-3-large
EMBEDDING_DIMENSIONS=3072
SIMILARITY_THRESHOLD=0.75
```

## Important Notes

1. **EMBEDDING_DIMENSIONS** must match your Pinecone index dimensions
2. **CHUNK_OVERLAP** should be less than **CHUNK_SIZE**
3. **SIMILARITY_THRESHOLD** should be between 0.0 and 1.0
4. Changes require restarting your development server
5. Changing embedding models requires recreating your Pinecone index 