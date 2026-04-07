import { IDatabaseService, QueryOptions } from '../../core/interfaces/IDatabaseService';
import { supabase } from '../SupabaseClient';

export class SupabaseDBAdapter implements IDatabaseService {
  async query<T>(table: string, options?: QueryOptions): Promise<T[]> {
    let query = supabase.from(table).select(options?.select || '*');

    if (options?.filters) {
      options.filters.forEach((filter) => {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.column, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.column, filter.value);
            break;
          case 'gt':
            query = query.gt(filter.column, filter.value);
            break;
          case 'lt':
            query = query.lt(filter.column, filter.value);
            break;
          case 'in':
            query = query.in(filter.column, filter.value);
            break;
        }
      });
    }

    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }

  async insert<T>(table: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase.from(table).insert(data).select().single();
    if (error) throw error;
    return result as T;
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select().single();
    if (error) throw error;
    return result as T;
  }

  async delete(table: string, id: string): Promise<void> {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  }

  subscribe<T>(table: string, event: 'INSERT' | 'UPDATE' | 'DELETE', callback: (data: T) => void): () => void {
    const subscription = supabase
      .channel(`${table}_${event}`)
      .on('postgres_changes', { event, schema: 'public', table }, (payload) => {
        callback(payload.new as T);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
}
