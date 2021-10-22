import { Global, Module, DynamicModule } from '@nestjs/common';
import { authenticationConfig } from './config/authentication.config';
import { AuthenticationConfigOptionsInterface } from './interface/authentication-config-options.interface';

@Global()
@Module({})
export class AuthenticationConfigModule {
  
  static forRoot(options?: AuthenticationConfigOptionsInterface): DynamicModule {
    return {
      module: AuthenticationConfigModule,
      providers: [
        {
          provide: authenticationConfig.KEY,
          useValue: options ?? authenticationConfig(),
        },
      ],
      exports: [authenticationConfig.KEY],
    };
  }
}
