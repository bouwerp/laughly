import { IStorageService, UploadOptions } from '../../core/interfaces/IStorageService';
import { supabase } from '../SupabaseClient';
import * as FileSystem from 'expo-file-system';
import * as tus from 'tus-js-client';

export class SupabaseStorageAdapter implements IStorageService {
  async uploadFile(fileUri: string, options: UploadOptions, onProgress?: (progress: number) => void): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session for upload');

    return new Promise((resolve, reject) => {
      const upload = new tus.Upload(FileSystem.cacheDirectory + 'temp_upload', {
        endpoint: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          'x-upsert': 'true',
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: options.bucket,
          objectName: options.path,
          contentType: options.contentType || 'application/octet-stream',
          cacheControl: '3600',
        },
        chunkSize: 6 * 1024 * 1024, // 6MB chunks
        onError: (error) => {
          console.error('TUS Upload failed:', error);
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const progress = bytesUploaded / bytesTotal;
          if (onProgress) onProgress(progress);
        },
        onSuccess: () => {
          resolve(options.path);
        },
      });

      this.prepareAndStartUpload(upload, fileUri);
    });
  }

  private async prepareAndStartUpload(upload: tus.Upload, fileUri: string) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) throw new Error('File does not exist');

      (upload as any).file = {
        uri: fileUri,
        name: fileUri.split('/').pop(),
        type: 'application/octet-stream',
        size: fileInfo.size,
      };

      upload.start();
    } catch (e) {
      console.error('Failed to prepare TUS upload', e);
    }
  }

  getPublicUrl(path: string, bucket: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteFile(path: string, bucket: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }
}
