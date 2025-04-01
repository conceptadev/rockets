import { DynamicModule, Module } from '@nestjs/common';
import {
  AuthenticationOptionsModuleClass,
  AuthenticationCombinedOptions,
  AuthenticationCombinedAsyncOptions,
} from './authentication-options.module-definition';

/**
 * Combined authentication module that provides all authentication options features
 * 
 * This module combines the options for the following modules:
 * - JwtModule: For JWT token handling
 * - AuthenticationModule: For core authentication services
 * - AuthJwtModule: For JWT-based authentication (optional)
 * - AuthRefreshModule: For refresh token handling (optional)
 */
@Module({})
export class AuthenticationOptionsModule extends AuthenticationOptionsModuleClass {
  
  static register(options: AuthenticationCombinedOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: AuthenticationCombinedAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: AuthenticationCombinedOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: AuthenticationCombinedAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
} 