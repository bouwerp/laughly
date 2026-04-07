import { IAuthService } from '../core/interfaces/IAuthService';
import { IStorageService } from '../core/interfaces/IStorageService';
import { IDatabaseService } from '../core/interfaces/IDatabaseService';
import { SupabaseAuthAdapter } from '../infrastructure/auth/SupabaseAuthAdapter';
import { SupabaseStorageAdapter } from '../infrastructure/storage/SupabaseStorageAdapter';
import { SupabaseDBAdapter } from '../infrastructure/database/SupabaseDBAdapter';

class ServiceContainer {
  private _authService: IAuthService;
  private _storageService: IStorageService;
  private _databaseService: IDatabaseService;

  constructor() {
    // Current implementations (Supabase)
    this._authService = new SupabaseAuthAdapter();
    this._storageService = new SupabaseStorageAdapter();
    this._databaseService = new SupabaseDBAdapter();
  }

  get authService(): IAuthService {
    return this._authService;
  }

  get storageService(): IStorageService {
    return this._storageService;
  }

  get databaseService(): IDatabaseService {
    return this._databaseService;
  }
}

export const services = new ServiceContainer();
