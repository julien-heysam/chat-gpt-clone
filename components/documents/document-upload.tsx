"use client"

import { useState, useRef } from "react"
import { Upload, File, X, Check, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentUploadProps {
  folderId: string
  onUploadSuccess: () => void
}

export function DocumentUpload({ folderId, onUploadSuccess }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'processing'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('error')
      setErrorMessage('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setUploadStatus('idle')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/folders/${folderId}/documents`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      if (result.processing) {
        setUploadStatus('processing')
        // Clear processing message after 5 seconds
        setTimeout(() => setUploadStatus('idle'), 5000)
      } else {
        setUploadStatus('success')
        // Clear success message after 3 seconds
        setTimeout(() => setUploadStatus('idle'), 3000)
      }
      
      onUploadSuccess()
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleFileSelect}
        disabled={isUploading}
        variant="outline"
        className="w-full justify-start gap-2 border-dashed border-white/20 hover:border-white/40 transition-colors"
      >
        <Upload className="h-4 w-4" />
        {isUploading ? 'Uploading...' : 'Upload Document'}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls,.ppt,.pptx"
      />

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 p-2 rounded border border-green-400/20">
          <Check className="h-4 w-4" />
          Document uploaded successfully!
        </div>
      )}

      {uploadStatus === 'processing' && (
        <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-400/10 p-2 rounded border border-blue-400/20">
          <Clock className="h-4 w-4 animate-spin" />
          Document uploaded! Processing for search capabilities...
        </div>
      )}

      {uploadStatus === 'error' && errorMessage && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <p className="text-xs text-white/40">
        Supported formats: PDF, DOC, DOCX, TXT, MD, CSV, XLS, XLSX, PPT, PPTX (Max 10MB)
        <br />
        Documents are automatically processed for AI search capabilities.
      </p>
    </div>
  )
} 