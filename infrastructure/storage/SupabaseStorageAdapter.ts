import { IStorageService, UploadOptions } from '../../core/interfaces/IStorageService';
import { supabase } from '../SupabaseClient';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export class SupabaseStorageAdapter implements IStorageService {
  async uploadFile(fileUri: string, options: UploadOptions): Promise<string> {
    // Read file as base64 since Supabase JS SDK works better with ArrayBuffer/Blob in RN
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(options.path, decode(base64), {
        contentType: options.contentType,
        upsert: true,
      });

    if (error) throw error;
    return data.path;
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
