import { DynamicModule, Module } from '@nestjs/common';

import { JwtIssueService } from './services/jwt-issue.service';
import { JwtSignService } from './services/jwt-sign.service';
import { JwtVerifyService } from './services/jwt-verify.service';
import {
  JwtModuleClass,
  createJwtImports,
  createJwtProviders,
  JWT_OPTIONS_TYPE,
  JWT_ASYNC_OPTIONS_TYPE,
} from './jwt.module-definition';
import { JwtOptionsInterface } from './interfaces/jwt-options.interface';
import { JwtOptionsExtrasInterface } from './interfaces/jwt-options-extras.interface';

@Module({
  providers: [JwtSignService, JwtIssueService, JwtVerifyService],
  exports: [JwtSignService, JwtIssueService, JwtVerifyService],
})
export class JwtModule extends JwtModuleClass {
  static register(
    options: Omit<typeof JWT_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.register(options);
  }

  static registerAsync(
    options: Omit<typeof JWT_ASYNC_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(
    options: Omit<typeof JWT_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(
    options: Omit<typeof JWT_ASYNC_OPTIONS_TYPE, 'global'>,
  ): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(
    options: JwtOptionsInterface & Pick<JwtOptionsExtrasInterface, 'imports'>,
  ): DynamicModule {
    return {
      module: JwtModule,
      imports: createJwtImports(options),
      providers: createJwtProviders({ overrides: options }),
    };
  }
}
