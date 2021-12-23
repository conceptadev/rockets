import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ModuleFactoryInterface } from '@rockts-org/nestjs-common';
import { JWT_MODULE_CONFIG_TOKEN } from '../config/jwt.config';
import { JwtCoreModule } from '../jwt-core.module';
import { JwtModule } from '../jwt.module';
import {
  JwtAsyncOptionsInterface,
  JwtOptionsInterface,
} from '../interfaces/jwt-options.interface';
import { IssueTokenService } from '../services/issue.service';

export class JwtModuleFactory
  implements ModuleFactoryInterface<JwtOptionsInterface>
{
  forRoot(options: JwtOptionsInterface) {
    return {
      module: JwtModule,
      global: options?.global ?? false,
      imports: [
        ...(options?.imports ?? []),
        JwtCoreModule.forRoot(options),
        NestJwtModule.register(options),
      ],
      providers: [IssueTokenService],
      exports: [IssueTokenService],
    };
  }

  forRootAsync(options: JwtAsyncOptionsInterface) {
    return {
      module: JwtModule,
      global: options?.global ?? false,
      imports: [
        ...(options?.imports ?? []),
        JwtCoreModule.forRootAsync(options),
        NestJwtModule.registerAsync({
          inject: [JWT_MODULE_CONFIG_TOKEN],
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
