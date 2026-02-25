import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { MAX_FILE_SIZE } from '../../utils/constants'
import { formatFileSize } from '../../utils/formatters'

export default function UploadZone({ onUpload, uploading, error }) {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        alert(`File too large. Max size: ${formatFileSize(MAX_FILE_SIZE)}`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        alert('Invalid file type. Please upload a PDF, DOCX, or TXT file.')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: uploading,
  })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all',
        isDragActive && 'border-blue-500 bg-blue-50',
        !isDragActive && !uploading && 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
        uploading && 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center space-y-4">
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600" />
            <p className="text-lg font-medium text-gray-700">
              Analyzing contract...
            </p>
            <p className="text-sm text-gray-500">
              This may take 1-3 minutes
            </p>
          </>
        ) : (
          <>
            {isDragActive ? (
              <>
                <Upload className="w-12 h-12 text-blue-600" />
                <p className="text-lg font-medium text-blue-700">
                  Drop your contract here
                </p>
              </>
            ) : (
              <>
                <FileText className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drop a contract here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF, DOCX, or TXT • Max {formatFileSize(MAX_FILE_SIZE)}
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}