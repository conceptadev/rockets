import { Global, Module, DynamicModule } from '@nestjs/common';
import { AuthenticationConfigOptionsInterface } from './interface/authentication-config-options.interface';

@Global()
@Module({})
export class AuthenticationConfigModule {
  
  static forRoot(options: AuthenticationConfigOptionsInterface): DynamicModule {
    return {
      module: AuthenticationConfigModule,
      providers: [
        {
          provide: "AUTH_MODULE_OPTIONS_TOKEN",
          useValue: options,
        },
      ],
      exports: ["AUTH_MODULE_OPTIONS_TOKEN"],
    };
  }
}
