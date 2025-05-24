"use client"

import { useState, useEffect } from "react"
import { File, Trash2, Download, Calendar, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Document } from "@/lib/types"

interface DocumentListProps {
  folderId: string
  refreshTrigger: number
}

export function DocumentList({ folderId, refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<Document | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [folderId, refreshTrigger])

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/folders/${folderId}/documents`)
      if (response.ok) {
        const docs = await response.json()
        setDocuments(docs)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (document: Document) => {
    console.log('🔴 Document delete clicked for:', document.id)
    setDeleteConfirmation(document)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return

    console.log('🔴 User confirmed document deletion for:', deleteConfirmation.id)
    setDeletingId(deleteConfirmation.id)
    
    try {
      console.log('🗑️ Attempting to delete document:', deleteConfirmation.id)
      
      const response = await fetch(`/api/documents/${deleteConfirmation.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('🔍 Document delete response status:', response.status)

      if (response.ok) {
        console.log('✅ Document deleted successfully')
        setDocuments(prev => prev.filter(doc => doc.id !== deleteConfirmation.id))
        setDeleteConfirmation(null)
      } else {
        const errorData = await response.json()
        console.error('❌ Document delete failed:', errorData)
        alert(`Failed to delete document: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error deleting document:', error)
      alert('Failed to delete document. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCancelDelete = () => {
    console.log('🔴 User cancelled document deletion')
    setDeleteConfirmation(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋'
    if (mimeType.includes('text')) return '📃'
    if (mimeType.includes('image')) return '🖼️'
    return '📁'
  }

  if (isLoading) {
    return (
      <div className="text-center text-white/60 py-8">
        <div className="animate-pulse">Loading documents...</div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center text-white/60 py-8">
        <File className="h-12 w-12 mx-auto mb-4 text-white/30" />
        <p className="text-sm">No documents uploaded yet</p>
        <p className="text-xs text-white/40 mt-1">Upload your first document to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-white/70 px-2 py-1 flex items-center gap-2">
        <File className="h-4 w-4" />
        Documents ({documents.length})
      </h3>
      
      {documents.map((document) => (
        <div
          key={document.id}
          className="group flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-lg">{getFileIcon(document.mimeType)}</span>
            
            <div className="min-w-0 flex-1">
              <div className="font-medium text-white/90 truncate text-sm">
                {document.originalName}
              </div>
              <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {formatFileSize(document.size)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(document.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/20"
              onClick={() => {
                // For now, just show an alert. In the future, this could download the file
                alert('Download functionality coming soon!')
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/20"
              onClick={() => handleDeleteClick(document)}
              disabled={deletingId === document.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/20 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Document</h3>
                <p className="text-sm text-white/60">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">"{deleteConfirmation.originalName}"</span>?
              <br />
              <span className="text-sm text-white/60">
                The document and all its processed data will be permanently deleted.
              </span>
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="border-white/20 text-white/80 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={deletingId === deleteConfirmation.id}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deletingId === deleteConfirmation.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 