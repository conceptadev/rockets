import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
} from '@rockts-org/nestjs-common';
import { passwordDefaultConfig } from './config/password-default.config';
import { PasswordOptionsInterface } from './interfaces/password-options.interface';
import {
  PASSWORD_MODULE_OPTIONS_TOKEN,
  PASSWORD_MODULE_SETTINGS_TOKEN,
} from './password.constants';

import { PasswordCreationService } from './services/password-creation.service';
import { PasswordStorageService } from './services/password-storage.service';
import { PasswordStrengthService } from './services/password-strength.service';

@Module({
  providers: [
    PasswordCreationService,
    PasswordStrengthService,
    PasswordStorageService,
  ],
  exports: [
    PasswordCreationService,
    PasswordStrengthService,
    PasswordStorageService,
  ],
})
export class PasswordModule extends createConfigurableDynamicRootModule<
  PasswordModule,
  PasswordOptionsInterface
>(PASSWORD_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(passwordDefaultConfig)],
  providers: [
    {
      provide: PASSWORD_MODULE_SETTINGS_TOKEN,
      inject: [PASSWORD_MODULE_OPTIONS_TOKEN, passwordDefaultConfig.KEY],
      useFactory: async (
        options: PasswordOptionsInterface,
        defaultSettings: ConfigType<typeof passwordDefaultConfig>,
      ) => options.settings ?? defaultSettings,
    },
  ],
}) {
  static register(options: PasswordOptionsInterface = {}) {
    return PasswordModule.forRoot(PasswordModule, options);
  }
  static registerAsync(options: AsyncModuleConfig<PasswordOptionsInterface>) {
    return PasswordModule.forRootAsync(PasswordModule, options);
  }
}
