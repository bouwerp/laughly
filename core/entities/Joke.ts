export interface Joke {
  id: string;
  createdAt: string;
  userId: string;
  title?: string;
  description?: string;
  mediaPath: string;
  mediaType: 'image' | 'video';
  mediaUrl?: string; // Signed or public URL
  tags?: string[];
  isFavorite: boolean;
  metadata?: Record<string, any>;
}
