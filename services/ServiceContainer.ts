import { IAuthService } from '../core/interfaces/IAuthService';
import { IDatabaseService } from '../core/interfaces/IDatabaseService';
import { IStorageService } from '../core/interfaces/IStorageService';
import { IModerationService } from '../core/interfaces/IModerationService';
import { SupabaseAuthAdapter } from '../infrastructure/auth/SupabaseAuthAdapter';
import { SupabaseDBAdapter } from '../infrastructure/database/SupabaseDBAdapter';
import { SupabaseStorageAdapter } from '../infrastructure/storage/SupabaseStorageAdapter';
import { SupabaseModerationAdapter } from '../infrastructure/moderation/SupabaseModerationAdapter';

interface ServiceContainer {
  authService: IAuthService;
  databaseService: IDatabaseService;
  storageService: IStorageService;
  moderationService: IModerationService;
}

// Initial implementations (Supabase)
const authService = new SupabaseAuthAdapter();
const databaseService = new SupabaseDBAdapter();
const storageService = new SupabaseStorageAdapter();
const moderationService = new SupabaseModerationAdapter();

export const services: ServiceContainer = {
  authService,
  databaseService,
  storageService,
  moderationService,
};
