export interface ModerationResult {
  isSafe: boolean;
  confidence: number;
  reason?: string;
  flaggedCategories?: string[];
}

export interface IModerationService {
  /**
   * Checks if a joke's text or media content is safe for the community.
   * @param content The text content or media URL to check.
   * @returns A promise that resolves to a ModerationResult.
   */
  moderateText(text: string): Promise<ModerationResult>;
  
  /**
   * Moderates an image or video based on its public URL.
   */
  moderateMedia(mediaUrl: string, mediaType: 'image' | 'video'): Promise<ModerationResult>;
}
