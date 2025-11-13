// src/components/chat/FilePreview.tsx
import { X, File, FileText, Image as ImageIcon } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  const isDocument = file.type.includes('document') || file.type.includes('word');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="w-8 h-8" />;
    if (isPDF || isDocument) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  return (
    <div className="relative group">
      <div className="border-2 border-gray-200 rounded-lg p-3 bg-white hover:border-fia-teal transition-colors">
        <div className="flex items-center space-x-3">
          {/* File Icon or Image Preview */}
          {isImage ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
              {getFileIcon()}
            </div>
          )}

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-600">
              {formatFileSize(file.size)}
            </p>
          </div>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-50 rounded-lg transition-colors text-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}