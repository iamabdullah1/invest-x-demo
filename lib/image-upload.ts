import CloudinaryService from './cloudinary';

export interface UploadResult {
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
}

export class ImageUploadService {
  /**
   * Upload a single image with optimization
   * @param file - File object from form input
   * @param folder - Cloudinary folder path
   * @param options - Additional upload options
   */
  static async uploadSingleImage(
    file: File,
    folder: string = 'investx',
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    } = {}
  ): Promise<UploadResult> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Only image files are allowed'
        };
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Set default transformations
      const transformations = [
        {
          width: options.width || 1200,
          height: options.height || 800,
          crop: options.crop || 'limit'
        },
        {
          quality: options.quality || 'auto:good'
        },
        {
          format: options.format || 'jpg'
        }
      ];

      // Upload to Cloudinary
      const result = await CloudinaryService.uploadFile(buffer, {
        folder,
        resource_type: 'image',
        transformation: transformations
      });

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload multiple images
   * @param files - Array of File objects
   * @param folder - Cloudinary folder path
   * @param options - Upload options
   */
  static async uploadMultipleImages(
    files: File[],
    folder: string = 'investx',
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    } = {}
  ): Promise<{
    success: boolean;
    results?: UploadResult[];
    error?: string;
  }> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadSingleImage(file, folder, options)
      );

      const results = await Promise.all(uploadPromises);
      
      const failedUploads = results.filter(result => !result.success);
      
      if (failedUploads.length > 0) {
        // Clean up successful uploads
        const successfulUploads = results.filter(result => result.success);
        await Promise.all(
          successfulUploads.map(upload => 
            CloudinaryService.deleteFile(upload.public_id!)
          )
        );
        
        return {
          success: false,
          error: `Failed to upload ${failedUploads.length} out of ${files.length} images`
        };
      }

      return {
        success: true,
        results
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload profile picture with circular crop
   * @param file - Profile picture file
   * @param userId - User ID for organization
   */
  static async uploadProfilePicture(
    file: File,
    userId: string
  ): Promise<UploadResult> {
    return this.uploadSingleImage(file, 'investx/profiles', {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto:good',
      format: 'jpg'
    });
  }

  /**
   * Upload project gallery images
   * @param files - Array of project image files
   * @param projectId - Project ID for organization
   */
  static async uploadProjectGallery(
    files: File[],
    projectId: string
  ): Promise<{
    success: boolean;
    results?: UploadResult[];
    error?: string;
  }> {
    return this.uploadMultipleImages(files, `investx/projects/${projectId}`, {
      width: 1200,
      height: 800,
      crop: 'fill',
      quality: 'auto:good',
      format: 'jpg'
    });
  }

  /**
   * Get optimized image URL for display
   * @param publicId - Cloudinary public ID
   * @param width - Desired width
   * @param height - Desired height
   * @param crop - Crop mode
   */
  static getOptimizedImageUrl(
    publicId: string,
    width: number = 400,
    height: number = 300,
    crop: string = 'fill'
  ): string {
    return CloudinaryService.getOptimizedUrl(publicId, [
      { width, height, crop },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]);
  }

  /**
   * Get thumbnail URL
   * @param publicId - Cloudinary public ID
   * @param size - Thumbnail size
   */
  static getThumbnailUrl(
    publicId: string,
    size: number = 150
  ): string {
    return CloudinaryService.getThumbnailUrl(publicId, size, size);
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Cloudinary public ID
   */
  static async deleteImage(publicId: string) {
    return CloudinaryService.deleteFile(publicId);
  }
}

export default ImageUploadService;
