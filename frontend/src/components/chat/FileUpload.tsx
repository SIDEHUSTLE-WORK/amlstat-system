// src/components/chat/FileUpload.tsx
import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import FilePreview from './FilePreview';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function FileUpload({ 
  onFilesSelected, 
  maxFiles = 5,
  maxSizeMB = 10 
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (const file of newFiles) {
      // Check file size
      if (file.size > maxSizeBytes) {
        alert(`${file.name} is too large. Max size is ${maxSizeMB}MB`);
        continue;
      }

      // Check if we've hit the max files limit
      if (selectedFiles.length + validFiles.length >= maxFiles) {
        alert(`You can only upload ${maxFiles} files at a time`);
        break;
      }

      validFiles.push(file);
    }

    const updatedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-fia-teal bg-fia-teal/5 scale-105'
            : 'border-gray-300 hover:border-fia-teal hover:bg-gray-50'
        }`}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDragging ? 'bg-fia-teal text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-600">
              or click to browse • Max {maxSizeMB}MB per file • Up to {maxFiles} files
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Selected Files ({selectedFiles.length}/{maxFiles})
            </p>
            <button
              onClick={() => {
                setSelectedFiles([]);
                onFilesSelected([]);
              }}
              className="text-sm text-red-600 hover:text-red-700 font-semibold"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => handleRemoveFile(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}