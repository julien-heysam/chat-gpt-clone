# Document Processing & RAG Setup Guide

This guide explains how to set up the document processing and Retrieval-Augmented Generation (RAG) functionality in your chat application.

## Features

- ✅ **Document Upload** - Upload PDF, DOCX, TXT, MD, CSV, XLS, XLSX, PPT, PPTX files
- ✅ **Text Extraction** - Automatically extract text from uploaded documents
- ✅ **Intelligent Chunking** - Split documents into overlapping chunks for better context
- ✅ **Vector Embeddings** - Generate embeddings using OpenAI's text-embedding models
- ✅ **Vector Database** - Store and index embeddings in Pinecone
- ✅ **Semantic Search** - Find relevant document chunks based on user queries
- ✅ **RAG Integration** - Automatically include relevant documents in AI responses
- ✅ **Folder-based Filtering** - Search documents within specific folders
- ✅ **Easy Configuration** - Customize all settings via environment variables

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# AI Model APIs (Required for embeddings and chat)
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Vector Database (Required for document search)
PINECONE_API_KEY="your-pinecone-api-key"

# Optional: Customize document processing (see DOCUMENT_CONFIG_EXAMPLE.md)
PINECONE_INDEX_NAME="documents"
EMBEDDING_MODEL="text-embedding-3-small"
CHUNK_SIZE="1000"
SIMILARITY_THRESHOLD="0.7"
```

## Easy Configuration

🎯 **NEW!** All document processing settings are now easily configurable via environment variables. See `DOCUMENT_CONFIG_EXAMPLE.md` for all available options including:

- **Index Names** - Use different Pinecone indexes
- **Embedding Models** - Switch between OpenAI embedding models
- **Chunk Sizes** - Customize how documents are split
- **Search Settings** - Control similarity thresholds and result counts
- **File Limits** - Adjust upload size limits

## Pinecone Setup

1. **Create a Pinecone Account**
   - Go to [pinecone.io](https://pinecone.io) and create an account
   - Get your API key from the dashboard

2. **Create an Index**
   - Create a new index with the name from `PINECONE_INDEX_NAME` (default: `documents`)
   - Set dimensions to match `EMBEDDING_DIMENSIONS` (default: `1536` for text-embedding-3-small)
   - Use `cosine` metric
   - Leave other settings as default

3. **Configure Environment**
   - Add your Pinecone API key to `.env.local`
   - Optionally customize other settings (see configuration examples)

## How It Works

### Document Upload Flow
1. User uploads a document to a folder
2. File is saved to local storage (`public/uploads/`)
3. Document metadata is stored in PostgreSQL
4. **Background Processing**:
   - Text is extracted from the file
   - Text is split into overlapping chunks (configurable size)
   - Each chunk is embedded using the configured embedding model
   - Vectors are stored in Pinecone with folder metadata

### Chat with Documents
1. User asks a question in a folder with documents
2. **RAG Process**:
   - User's message is embedded using the same model
   - Semantic search finds relevant document chunks (configurable threshold)
   - Relevant chunks are included in the AI system prompt
   - AI generates response with document context
   - AI can cite specific documents in its response

### Document Management
- **View Documents**: See all documents in a folder with metadata
- **Delete Documents**: Removes file, database record, and vector embeddings
- **Folder Isolation**: Documents are only searchable within their folder

## Supported File Types

| Type | Extensions | Processing |
|------|------------|------------|
| PDF | `.pdf` | Full text extraction with pdf-parse (fallback available) |
| Word | `.doc`, `.docx` | Text extraction with mammoth |
| Text | `.txt`, `.md` | Direct reading |
| Spreadsheets | `.csv`, `.xlsx`, `.xls` | Planned (not yet implemented) |
| Presentations | `.ppt`, `.pptx` | Planned (not yet implemented) |

## Configuration Options

You can now easily customize all settings via environment variables! Check `DOCUMENT_CONFIG_EXAMPLE.md` for examples, or modify these key settings:

```bash
# Chunk size (words per chunk) - Default: 1000
CHUNK_SIZE=800

# Overlap between chunks (words) - Default: 200
CHUNK_OVERLAP=150

# Similarity threshold for including documents - Default: 0.7
SIMILARITY_THRESHOLD=0.8

# Number of document chunks to retrieve - Default: 5
SEARCH_TOP_K=3
```

## API Endpoints

- `POST /api/folders/[id]/documents` - Upload document
- `GET /api/folders/[id]/documents` - List documents in folder
- `DELETE /api/documents/[id]` - Delete document
- `POST /api/documents/search` - Search documents (internal use)

## Troubleshooting

### Documents not being processed
- Check console logs for processing errors
- Verify OpenAI API key is valid
- Ensure Pinecone is configured correctly
- Check configuration with the logged output

### Search not working
- Verify Pinecone index exists and has correct dimensions
- Check that documents have been processed (look for console logs)
- Ensure OPENAI_API_KEY is set for embeddings
- Verify EMBEDDING_DIMENSIONS matches your Pinecone index

### Large files failing
- Adjust MAX_FILE_SIZE in environment variables
- Very large PDFs may time out during processing
- Consider splitting large documents

## Cost Considerations

- **OpenAI Embeddings**: Varies by model (~$0.0001-0.0003 per 1000 tokens)
- **Pinecone**: Free tier includes 1 index, paid plans start at $70/month
- **Example**: A 100-page document (~50k words) costs ~$0.005-0.015 to embed

## Next Steps

- **Configuration UI**: Admin interface for changing settings
- **Vector Database Alternatives**: Support for AstraDB, Weaviate, or local vector storage
- **Advanced Chunking**: Semantic chunking based on document structure
- **Multiple File Types**: Enhanced support for spreadsheets and presentations
- **Document Versioning**: Track document changes and update embeddings
- **Metadata Extraction**: Extract and index document metadata (author, date, etc.) 