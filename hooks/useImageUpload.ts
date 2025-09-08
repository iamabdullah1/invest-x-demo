"use client"

import { useState, useCallback } from 'react';

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  public_id?: string;
  error?: string;
}

export interface UseImageUploadOptions {
  folder?: string;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
  acceptedTypes?: string[];
  autoUpload?: boolean;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    folder = 'investx',
    maxFiles = 10,
    maxSizePerFile = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    autoUpload = false
  } = options;

  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'File type not supported. Please upload JPEG, PNG, or WebP images.';
    }

    if (file.size > maxSizePerFile) {
      const maxSizeMB = Math.round(maxSizePerFile / (1024 * 1024));
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  }, [acceptedTypes, maxSizePerFile]);

  const addFiles = useCallback((files: File[]) => {
    const validFiles: UploadProgress[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({
          file,
          progress: 0,
          status: 'pending'
        });
      }
    });

    setUploads(prev => {
      const newUploads = [...prev, ...validFiles];
      if (newUploads.length > maxFiles) {
        const trimmed = newUploads.slice(0, maxFiles);
        errors.push(`Maximum ${maxFiles} files allowed. Some files were not added.`);
        return trimmed;
      }
      return newUploads;
    });

    if (errors.length > 0) {
      console.warn('File validation errors:', errors);
    }

    if (autoUpload && validFiles.length > 0) {
      uploadFiles();
    }

    return { validFiles: validFiles.length, errors };
  }, [validateFile, maxFiles, autoUpload]);

  const uploadFiles = useCallback(async () => {
    setIsUploading(true);

    const pendingUploads = uploads.filter(upload => upload.status === 'pending');
    
    for (const upload of pendingUploads) {
      try {
        // Update status to uploading
        setUploads(prev => prev.map(u => 
          u.file === upload.file 
            ? { ...u, status: 'uploading' as const, progress: 0 }
            : u
        ));

        // Create FormData
        const formData = new FormData();
        formData.append('file', upload.file);
        formData.append('folder', folder);

        // Upload to our API endpoint
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          // Update with success
          setUploads(prev => prev.map(u => 
            u.file === upload.file 
              ? { 
                  ...u, 
                  status: 'success' as const, 
                  progress: 100,
                  url: result.url,
                  public_id: result.public_id
                }
              : u
          ));
        } else {
          throw new Error(result.error || 'Upload failed');
        }

      } catch (error: any) {
        // Update with error
        setUploads(prev => prev.map(u => 
          u.file === upload.file 
            ? { 
                ...u, 
                status: 'error' as const, 
                error: error.message 
              }
            : u
        ));
      }
    }

    setIsUploading(false);
  }, [uploads, folder]);

  const removeFile = useCallback((file: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== file));
  }, []);

  const clearAll = useCallback(() => {
    setUploads([]);
  }, []);

  const getSuccessfulUploads = useCallback(() => {
    return uploads.filter(upload => upload.status === 'success');
  }, [uploads]);

  const getFailedUploads = useCallback(() => {
    return uploads.filter(upload => upload.status === 'error');
  }, [uploads]);

  return {
    uploads,
    isUploading,
    addFiles,
    uploadFiles,
    removeFile,
    clearAll,
    getSuccessfulUploads,
    getFailedUploads,
    hasSuccessfulUploads: uploads.some(u => u.status === 'success'),
    hasFailedUploads: uploads.some(u => u.status === 'error'),
    allUploadsComplete: uploads.length > 0 && uploads.every(u => u.status === 'success' || u.status === 'error'),
  };
}

export default useImageUpload;
