import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '../services/ServiceContainer';
import { Joke } from '../core/entities/Joke';
import { useAuth } from './useAuth';
import { supabase } from '../infrastructure/SupabaseClient';

export function useJokes() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // 1. Set up Realtime Subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    // Use a unique channel name to avoid "already subscribed" errors during re-renders
    const channelId = `jokes-realtime-${session.user.id}-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jokes',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload.eventType);
          // Invalidate the cache to trigger a refetch
          queryClient.invalidateQueries({ queryKey: ['jokes', session.user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, queryClient]);

  // Fetch all jokes for the current user
  const { data: jokes, isLoading, error, refetch } = useQuery({
    queryKey: ['jokes', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const data = await services.databaseService.query<any>('jokes', {
        filters: [{ column: 'user_id', value: session.user.id, operator: 'eq' }],
        order: { column: 'created_at', ascending: false },
      });

      // Map to domain entity and resolve public URLs
      return data.map((item) => {
        const joke: Joke = {
          id: item.id,
          createdAt: item.created_at,
          userId: item.user_id,
          title: item.title,
          description: item.description,
          mediaPath: item.media_path,
          mediaType: item.media_type,
          tags: item.tags,
          isFavorite: item.is_favorite,
          metadata: item.metadata,
        };

        // If the path exists, resolve the public URL
        if (joke.mediaPath) {
          joke.mediaUrl = services.storageService.getPublicUrl(joke.mediaPath, 'media');
        }

        return joke;
      });
    },
    enabled: !!session?.user?.id,
  });

  // Delete a joke
  const deleteJoke = useMutation({
    mutationFn: async (joke: Joke) => {
      // 1. Delete media from storage
      await services.storageService.deleteFile(joke.mediaPath, 'media');
      // 2. Delete record from database
      await services.databaseService.delete('jokes', joke.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jokes', session?.user?.id] });
    },
  });

  // Toggle favorite
  const toggleFavorite = useMutation({
    mutationFn: async (joke: Joke) => {
      await services.databaseService.update('jokes', joke.id, {
        is_favorite: !joke.isFavorite,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jokes', session?.user?.id] });
    },
  });

  return {
    jokes,
    isLoading,
    error,
    refetch,
    deleteJoke,
    toggleFavorite,
  };
}
