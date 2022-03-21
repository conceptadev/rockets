import { Module } from '@nestjs/common';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@rockts-org/nestjs-common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AccessControlModuleOptionsInterface } from './interfaces/access-control-module-options.interface';
import { accessControlDefaultConfig } from './config/acess-control-default.config';
import {
  ACCESS_CONTROL_MODULE_OPTIONS_TOKEN,
  ACCESS_CONTROL_MODULE_SETTINGS_TOKEN,
} from './constants';
import { AccessControlService } from './services/access-control.service';
import { DefaultAccessControlService } from './services/default-access-control.service';

@Module({
  providers: [DefaultAccessControlService],
  exports: [AccessControlService],
})
export class AccessControlModule extends createConfigurableDynamicRootModule<
  AccessControlModule,
  AccessControlModuleOptionsInterface
>(ACCESS_CONTROL_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(accessControlDefaultConfig)],
  providers: [
    {
      provide: ACCESS_CONTROL_MODULE_SETTINGS_TOKEN,
      inject: [
        ACCESS_CONTROL_MODULE_OPTIONS_TOKEN,
        accessControlDefaultConfig.KEY,
      ],
      useFactory: async (
        options: AccessControlModuleOptionsInterface,
        defaultSettings: ConfigType<typeof accessControlDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: AccessControlService,
      inject: [
        ACCESS_CONTROL_MODULE_OPTIONS_TOKEN,
        DefaultAccessControlService,
      ],
      useFactory: async (
        options: AccessControlModuleOptionsInterface,
        defaultService: DefaultAccessControlService,
      ) => options.service ?? defaultService,
    },
  ],
  exports: [ACCESS_CONTROL_MODULE_SETTINGS_TOKEN],
}) {
  static register(options: AccessControlModuleOptionsInterface = {}) {
    return AccessControlModule.forRoot(AccessControlModule, options);
  }

  static registerAsync(
    options: AsyncModuleConfig<AccessControlModuleOptionsInterface>,
  ) {
    return AccessControlModule.forRootAsync(AccessControlModule, {
      useFactory: () => ({}),
      ...options,
    });
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<
      AccessControlModule,
      AccessControlModuleOptionsInterface
    >(AccessControlModule, options);
  }
}
