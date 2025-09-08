import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  /**
   * Upload a file to Cloudinary
   * @param file - File buffer or base64 string
   * @param options - Upload options
   */
  static async uploadFile(
    file: Buffer | string,
    options: {
      folder?: string;
      public_id?: string;
      resource_type?: 'image' | 'video' | 'raw' | 'auto';
      format?: string;
      transformation?: any[];
    } = {}
  ) {
    try {
      const {
        folder = 'investx',
        resource_type = 'auto',
        ...restOptions
      } = options;

      // Convert buffer to base64 if needed
      let fileData: string;
      if (Buffer.isBuffer(file)) {
        fileData = `data:image/jpeg;base64,${file.toString('base64')}`;
      } else {
        fileData = file;
      }

      const result = await cloudinary.uploader.upload(fileData, {
        folder,
        resource_type,
        ...restOptions,
      });

      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        asset_id: result.asset_id,
        version_id: result.version_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload verification documents (ID cards)
   * @param frontIdFile - Front ID card file buffer
   * @param backIdFile - Back ID card file buffer
   * @param verificationId - Unique verification ID
   */
  static async uploadVerificationDocuments(
    frontIdFile: Buffer,
    backIdFile: Buffer,
    verificationId: string
  ) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Upload front ID card
      const frontUpload = await this.uploadFile(frontIdFile, {
        folder: 'investx/verifications',
        public_id: `${verificationId}/front-id-${timestamp}`,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 700, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'jpg' }
        ]
      });

      if (!frontUpload.success) {
        throw new Error(`Front ID upload failed: ${frontUpload.error}`);
      }

      // Upload back ID card
      const backUpload = await this.uploadFile(backIdFile, {
        folder: 'investx/verifications',
        public_id: `${verificationId}/back-id-${timestamp}`,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 700, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'jpg' }
        ]
      });

      if (!backUpload.success) {
        // If back upload fails, we should delete the front upload
        await this.deleteFile(frontUpload.public_id!);
        throw new Error(`Back ID upload failed: ${backUpload.error}`);
      }

      return {
        success: true,
        frontId: {
          url: frontUpload.url,
          public_id: frontUpload.public_id,
        },
        backId: {
          url: backUpload.url,
          public_id: backUpload.public_id,
        },
      };
    } catch (error: any) {
      console.error('Verification documents upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload project images
   * @param files - Array of image file buffers
   * @param projectId - Project ID for organization
   */
  static async uploadProjectImages(files: Buffer[], projectId: string) {
    try {
      const uploadPromises = files.map((file, index) =>
        this.uploadFile(file, {
          folder: 'investx/projects',
          public_id: `${projectId}/image-${index + 1}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'fill' },
            { quality: 'auto:good' },
            { format: 'jpg' }
          ]
        })
      );

      const results = await Promise.all(uploadPromises);
      
      const failedUploads = results.filter(result => !result.success);
      if (failedUploads.length > 0) {
        // Clean up successful uploads if any failed
        const successfulUploads = results.filter(result => result.success);
        await Promise.all(
          successfulUploads.map(upload => 
            this.deleteFile(upload.public_id!)
          )
        );
        
        throw new Error(`Failed to upload ${failedUploads.length} images`);
      }

      return {
        success: true,
        images: results.map(result => ({
          url: result.url,
          public_id: result.public_id,
        })),
      };
    } catch (error: any) {
      console.error('Project images upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a file from Cloudinary
   * @param publicId - Public ID of the file to delete
   */
  static async deleteFile(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return {
        success: result.result === 'ok',
        result: result.result,
      };
    } catch (error: any) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload project image to Cloudinary
   * @param imageBuffer - Image file buffer
   * @param projectId - Project ID for organization
   * @param imageName - Name/identifier for the image
   * @param originalFileName - Original filename
   */
  static async uploadProjectImage(
    imageBuffer: Buffer,
    projectId: string,
    imageName: string,
    originalFileName: string
  ) {
    try {
      console.log(`📤 Uploading project image: ${imageName} for project ${projectId}`);

      const result = await this.uploadFile(imageBuffer, {
        folder: `investx/projects/${projectId}`,
        public_id: `${imageName}_${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { width: 1200, height: 800, crop: 'limit' },
          { format: 'webp' }
        ]
      });

      if (result.success) {
        console.log(`✅ Project image uploaded successfully: ${result.url}`);
        return {
          success: true,
          url: result.url,
          public_id: result.public_id,
          thumbnail: this.getThumbnailUrl(result.public_id!, 400, 300)
        };
      } else {
        console.error(`❌ Project image upload failed: ${result.error}`);
        return {
          success: false,
          error: result.error
        };
      }

    } catch (error: any) {
      console.error('Project image upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get optimized image URL with transformations
   * @param publicId - Public ID of the image
   * @param transformations - Cloudinary transformations
   */
  static getOptimizedUrl(
    publicId: string,
    transformations: any[] = []
  ) {
    return cloudinary.url(publicId, {
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
        ...transformations,
      ],
    });
  }

  /**
   * Generate a thumbnail URL
   * @param publicId - Public ID of the image
   * @param width - Thumbnail width
   * @param height - Thumbnail height
   */
  static getThumbnailUrl(
    publicId: string,
    width: number = 300,
    height: number = 200
  ) {
    return this.getOptimizedUrl(publicId, [
      { width, height, crop: 'fill' },
      { quality: 'auto:good' },
    ]);
  }
}

export default CloudinaryService;
