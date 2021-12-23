import {
  ConfigAsyncInterface,
  ConfigInterface,
  ModuleFactoryInterface,
} from '@rockts-org/nestjs-common';

import { IssueTokenService } from '../services/issue.service';
import { jwtOptions, JWT_MODULE_OPTIONS_TOKEN } from '../config/jwt.config';
import { JwtCoreModule } from '../jwt-core.module';
import { JwtModule } from '../jwt.module';
import { JwtOptionsInterface } from '../interfaces/jwt-options.interface';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

export class JwtModuleFactory
  implements ModuleFactoryInterface<JwtOptionsInterface>
{
  forRoot(config: ConfigInterface<JwtOptionsInterface>) {
    return {
      module: JwtModule,
      global: config?.global ?? false,
      imports: [
        ...(config?.imports ?? []),
        JwtCoreModule.forRoot(config),
        NestJwtModule.register(config?.options ?? jwtOptions()),
      ],
      providers: [IssueTokenService],
      exports: [IssueTokenService],
    };
  }

  forRootAsync(config: ConfigAsyncInterface<JwtOptionsInterface>) {
    return {
      module: JwtModule,
      global: config?.global ?? false,
      imports: [
        ...(config?.imports ?? []),
        JwtCoreModule.forRootAsync(config),
        NestJwtModule.registerAsync({
          inject: [JWT_MODULE_OPTIONS_TOKEN],
          useFactory: async (options: JwtOptionsInterface) => {
            return options;
          },
        }),
      ],
      providers: [IssueTokenService],
      exports: [IssueTokenService],
    };
  }
}
