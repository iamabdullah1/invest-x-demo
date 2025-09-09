// Cloudinary service disabled for bundle optimization

export class CloudinaryService {
  static async uploadFile(): Promise<any> {
    throw new Error('Cloudinary service disabled for bundle optimization')
  }
  
  static async deleteFile(): Promise<any> {
    throw new Error('Cloudinary service disabled for bundle optimization')
  }
  
  static async uploadProfilePicture(): Promise<any> {
    throw new Error('Cloudinary service disabled for bundle optimization')
  }
  
  static async uploadIdCard(): Promise<any> {
    throw new Error('Cloudinary service disabled for bundle optimization')
  }
  
  static async uploadProjectImages(): Promise<any> {
    throw new Error('Cloudinary service disabled for bundle optimization')
  }
  
  static async uploadProjectImage(): Promise<any> {
    throw new Error('Cloudinary service disabled for bundle optimization')
  }
  
  static async uploadVerificationDocuments(): Promise<any> {
    throw new Error('Cloudinary service disabled for bundle optimization')
  }
  
  static getOptimizedUrl(): string {
    return '/placeholder.jpg'
  }
}

export default CloudinaryService;
