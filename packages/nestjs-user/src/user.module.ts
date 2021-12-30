import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
} from '@rockts-org/nestjs-common';
import { userDefaultConfig } from './config/user-default.config';
import { UserOptionsInterface } from './interfaces/user-options.interface';
import { UserLookupService } from './services/user-lookup.service';
import { UserService } from './services/user.service';
import {
  USER_MODULE_OPTIONS_TOKEN,
  USER_MODULE_SETTINGS_TOKEN,
} from './user.constants';

@Module({
  providers: [UserService, UserLookupService],
  exports: [UserService, UserLookupService],
})
export class UserModule extends createConfigurableDynamicRootModule<
  UserModule,
  UserOptionsInterface
>(USER_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(userDefaultConfig)],
  providers: [
    {
      provide: USER_MODULE_SETTINGS_TOKEN,
      inject: [USER_MODULE_OPTIONS_TOKEN, userDefaultConfig.KEY],
      useFactory: async (
        options: UserOptionsInterface,
        defaultSettings: ConfigType<typeof userDefaultConfig>,
      ) => options.settings ?? defaultSettings,
    },
  ],
}) {
  static register(options: UserOptionsInterface = {}) {
    return UserModule.forRoot(UserModule, options);
  }

  static registerAsync(options: AsyncModuleConfig<UserOptionsInterface>) {
    return UserModule.forRootAsync(UserModule, {
      useFactory: () => ({}),
      ...options,
    });
  }

  static deferred(timeout = 2000) {
    return UserModule.externallyConfigured(UserModule, timeout);
  }
}
