"use client"

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { useImageUpload, UseImageUploadOptions } from '@/hooks/useImageUpload';

interface ImageUploadProps extends UseImageUploadOptions {
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (errors: string[]) => void;
  className?: string;
  multiple?: boolean;
  showPreview?: boolean;
  uploadButtonText?: string;
  dropzoneText?: string;
}

export function ImageUpload({
  onUploadComplete,
  onUploadError,
  className = '',
  multiple = true,
  showPreview = true,
  uploadButtonText = 'Upload Images',
  dropzoneText = 'Drop images here or click to browse',
  ...options
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    uploads,
    isUploading,
    addFiles,
    uploadFiles,
    removeFile,
    clearAll,
    getSuccessfulUploads,
    getFailedUploads,
    allUploadsComplete
  } = useImageUpload(options);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      addFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    await uploadFiles();
    
    const successful = getSuccessfulUploads();
    const failed = getFailedUploads();

    if (successful.length > 0 && onUploadComplete) {
      onUploadComplete(successful.map(u => u.url!));
    }

    if (failed.length > 0 && onUploadError) {
      onUploadError(failed.map(u => u.error || 'Upload failed'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-b-transparent" />;
      default:
        return <ImageIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <Card
        className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">{dropzoneText}</p>
          <p className="text-xs text-gray-500">
            Supports JPEG, PNG, WebP up to {Math.round((options.maxSizePerFile || 10485760) / (1024 * 1024))}MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </Card>

      {/* File List */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Selected Files ({uploads.length})</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploads.map((upload, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center space-x-3">
                  {/* Preview */}
                  {showPreview && upload.status === 'success' && upload.url && (
                    <img
                      src={upload.url}
                      alt={upload.file.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                  
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(upload.status)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{upload.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {/* Progress */}
                    {upload.status === 'uploading' && (
                      <Progress value={upload.progress} className="mt-1 h-1" />
                    )}
                    
                    {/* Error */}
                    {upload.status === 'error' && (
                      <p className="text-xs text-red-500 mt-1">{upload.error}</p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(upload.file)}
                    disabled={isUploading}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {uploads.some(u => u.status === 'pending') && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
              Uploading...
            </>
          ) : (
            uploadButtonText
          )}
        </Button>
      )}

      {/* Success Message */}
      {allUploadsComplete && uploads.every(u => u.status === 'success') && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <p className="text-sm text-green-700">All images uploaded successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
