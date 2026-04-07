export interface IDatabaseService {
  query<T>(table: string, options?: QueryOptions): Promise<T[]>;
  insert<T>(table: string, data: Partial<T>): Promise<T>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<void>;
  subscribe<T>(table: string, event: 'INSERT' | 'UPDATE' | 'DELETE', callback: (data: T) => void): () => void;
}

export interface QueryOptions {
  select?: string;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  filters?: { column: string; value: any; operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' }[];
}
