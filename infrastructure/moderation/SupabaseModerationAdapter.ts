import { IModerationService, ModerationResult } from '../../core/interfaces/IModerationService';
import { supabase } from '../SupabaseClient';

export class SupabaseModerationAdapter implements IModerationService {
  async moderateText(text: string): Promise<ModerationResult> {
    const { data, error } = await supabase.functions.invoke('moderate-content', {
      body: { content: text, type: 'text' }
    });

    if (error) {
      console.error('Text moderation failed:', error);
      // Fail safe in development
      return { isSafe: true, confidence: 0 };
    }

    return data as ModerationResult;
  }

  async moderateMedia(mediaUrl: string, mediaType: 'image' | 'video'): Promise<ModerationResult> {
    const { data, error } = await supabase.functions.invoke('moderate-content', {
      body: { content: mediaUrl, type: mediaType }
    });

    if (error) {
      console.error('Media moderation failed:', error);
      // Fail safe in development
      return { isSafe: true, confidence: 0 };
    }

    return data as ModerationResult;
  }
}
