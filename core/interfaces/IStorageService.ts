export interface UploadOptions {
  bucket: string;
  path: string;
  contentType?: string;
}

export interface IStorageService {
  uploadFile(fileUri: string, options: UploadOptions): Promise<string>; // Returns the public URL or file path
  getPublicUrl(path: string, bucket: string): string;
  deleteFile(path: string, bucket: string): Promise<void>;
}
