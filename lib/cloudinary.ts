// Optimized Cloudinary service - only loads when needed
let cloudinaryV2: any = null;

// Lazy load Cloudinary only when needed to avoid bundle bloat
async function getCloudinary() {
  if (!cloudinaryV2) {
    const { v2 } = await import('cloudinary');
    cloudinaryV2 = v2;
    
    cloudinaryV2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  return cloudinaryV2;
}

export class CloudinaryService {
  static async uploadFile(fileBuffer: Buffer, fileName: string, folder?: string): Promise<any> {
    try {
      const cloudinary = await getCloudinary();
      
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            public_id: fileName,
            folder: folder || 'investx',
            use_filename: true,
            unique_filename: false,
          },
          (error: any, result: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(fileBuffer);
      });
    } catch (error) {
      throw new Error(`File upload failed: ${error}`);
    }
  }
  
  static async deleteFile(publicId: string): Promise<any> {
    try {
      const cloudinary = await getCloudinary();
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(`File deletion failed: ${error}`);
    }
  }
  
  static async uploadProfilePicture(fileBuffer: Buffer, userId: string): Promise<any> {
    const fileName = `profile_${userId}_${Date.now()}`;
    return this.uploadFile(fileBuffer, fileName, 'investx/profiles');
  }
  
  static async uploadIdCard(fileBuffer: Buffer, userId: string): Promise<any> {
    const fileName = `id_card_${userId}_${Date.now()}`;
    return this.uploadFile(fileBuffer, fileName, 'investx/documents');
  }
  
  static async uploadProjectImages(fileBuffers: Buffer[], projectId: string): Promise<any[]> {
    const uploadPromises = fileBuffers.map((buffer, index) => {
      const fileName = `project_${projectId}_${index}_${Date.now()}`;
      return this.uploadFile(buffer, fileName, 'investx/projects');
    });
    
    return Promise.all(uploadPromises);
  }
  
  static async uploadProjectImage(fileBuffer: Buffer, projectId: string, imageIndex?: number): Promise<any> {
    const fileName = `project_${projectId}_${imageIndex || 0}_${Date.now()}`;
    return this.uploadFile(fileBuffer, fileName, 'investx/projects');
  }
  
  static async uploadVerificationDocuments(frontBuffer: Buffer, backBuffer: Buffer, verificationId: string): Promise<{ success: boolean; frontId?: any; backId?: any }> {
    try {
      const frontFileName = `verification_front_${verificationId}_${Date.now()}`;
      const backFileName = `verification_back_${verificationId}_${Date.now()}`;

      const [frontResult, backResult] = await Promise.all([
        this.uploadFile(frontBuffer, frontFileName, 'investx/verification'),
        this.uploadFile(backBuffer, backFileName, 'investx/verification')
      ]);

      return {
        success: true,
        frontId: frontResult,
        backId: backResult
      };
    } catch (error) {
      console.error('Error uploading verification documents:', error);
      return {
        success: false
      };
    }
  }
  
  static getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  }): string {
    if (!publicId || publicId === '/placeholder.jpg') {
      return '/placeholder.jpg';
    }
    
    const { width, height, quality = 'auto', format = 'auto' } = options || {};
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
    let transformations = `f_${format},q_${quality}`;
    if (width) transformations += `,w_${width}`;
    if (height) transformations += `,h_${height}`;
    if (width && height) transformations += ',c_fill';
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
  }
}

export default CloudinaryService;
