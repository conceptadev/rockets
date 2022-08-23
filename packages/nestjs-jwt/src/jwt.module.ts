import { DynamicModule, Module } from '@nestjs/common';

import { JwtIssueService } from './services/jwt-issue.service';
import { JwtSignService } from './services/jwt-sign.service';
import { JwtVerifyService } from './services/jwt-verify.service';
import {
  JwtModuleClass,
  JwtOptions,
  JwtAsyncOptions,
  createJwtImports,
  createJwtProviders,
  createJwtExports,
} from './jwt.module-definition';

@Module({
  providers: [JwtSignService, JwtIssueService, JwtVerifyService],
  exports: [JwtSignService, JwtIssueService, JwtVerifyService],
})
export class JwtModule extends JwtModuleClass {
  static register(options: JwtOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: JwtAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: JwtOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: JwtAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: JwtOptions): DynamicModule {
    return {
      module: JwtModule,
      imports: createJwtImports(options),
      providers: createJwtProviders({ overrides: options }),
      exports: createJwtExports(),
    };
  }
}
