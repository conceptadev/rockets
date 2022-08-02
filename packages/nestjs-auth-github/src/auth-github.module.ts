import { DynamicModule, Module } from '@nestjs/common';
import { AuthGithubStrategy } from './auth-github.strategy';
import { AuthGithubController } from './auth-github.controller';
import {
  AuthGithubAsyncOptions,
  AuthGithubModuleClass,
  AuthGithubOptions,
  createAuthGithubControllers,
  createAuthGithubImports,
  createAuthGithubProviders,
} from './auth-github.module-definition';

/**
 * Auth GitHub module
 */
@Module({
  providers: [AuthGithubStrategy],
  controllers: [AuthGithubController],
})
export class AuthGithubModule extends AuthGithubModuleClass {
  static register(options: AuthGithubOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: AuthGithubAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: AuthGithubOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: AuthGithubAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: AuthGithubOptions): DynamicModule {
    return {
      module: AuthGithubModule,
      imports: createAuthGithubImports(),
      providers: createAuthGithubProviders({ overrides: options }),
      controllers: createAuthGithubControllers(options),
    };
  }
}
