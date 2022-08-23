import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
  ModuleOptionsControllerInterface,
  negotiateController,
} from '@concepta/nestjs-core';
import {
  getDynamicRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';
import {
  OTP_MODULE_REPOSITORIES_TOKEN,
  OTP_MODULE_OPTIONS_TOKEN,
  OTP_MODULE_SETTINGS_TOKEN,
} from './otp.constants';
import { otpDefaultConfig } from './config/otp-default.config';
import { OtpOptionsInterface } from './interfaces/otp-options.interface';
import { OtpEntitiesOptionsInterface } from './interfaces/otp-entities-options.interface';
import { OtpService } from './services/otp.service';

/**
 * Otp Module
 */
@Module({
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule extends createConfigurableDynamicRootModule<
  OtpModule,
  OtpOptionsInterface
>(OTP_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(otpDefaultConfig)],
  providers: [
    {
      provide: OTP_MODULE_SETTINGS_TOKEN,
      inject: [OTP_MODULE_OPTIONS_TOKEN, otpDefaultConfig.KEY],
      useFactory: async (
        options: OtpOptionsInterface,
        defaultSettings: ConfigType<typeof otpDefaultConfig>,
      ) => options.settings ?? defaultSettings,
    },
  ],
}) {
  /**
   * Register the Otp module synchronously.
   *
   * @param options module options
   */
  static register(
    options: OtpOptionsInterface &
      OtpEntitiesOptionsInterface &
      ModuleOptionsControllerInterface,
  ) {
    const module = OtpModule.forRoot(OtpModule, options);

    if (!module.providers) {
      module.providers = [];
    }

    module.providers.push(this.getAllProviders(options.entities));

    if (!module.imports) {
      module.imports = [];
    }

    module.imports.push(TypeOrmExtModule.forFeature(options.entities));

    negotiateController(module, options);

    // TODO: this is temporary for module builder migration
    module.global = true;

    return module;
  }

  /**
   * Register the Otp module asynchronously.
   *
   * @param options module options
   */
  static registerAsync(
    options: AsyncModuleConfig<OtpOptionsInterface> &
      OtpEntitiesOptionsInterface &
      ModuleOptionsControllerInterface,
  ) {
    const module = OtpModule.forRootAsync(OtpModule, {
      useFactory: () => ({}),
      ...options,
    });

    if (!module.providers) {
      module.providers = [];
    }

    module.providers.push(this.getAllProviders(options.entities));

    if (!module.imports) {
      module.imports = [];
    }

    module.imports.push(TypeOrmExtModule.forFeature(options.entities));

    negotiateController(module, options);

    return module;
  }

  /**
   * Expect another module to have registered the Otp module.
   *
   * @param options module defer options
   */
  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<OtpModule, OtpOptionsInterface>(OtpModule, options);
  }

  private static getAllProviders(
    entities: OtpEntitiesOptionsInterface['entities'],
  ) {
    const reposToInject = [];
    const keyTracker: Record<string, number> = {};

    let entityIdx = 0;

    for (const entityKey in entities) {
      reposToInject[entityIdx] = getDynamicRepositoryToken(entityKey);
      keyTracker[entityKey] = entityIdx++;
    }

    return {
      provide: OTP_MODULE_REPOSITORIES_TOKEN,
      useFactory: (...args: string[]) => {
        const repoInstances: Record<string, string> = {};

        for (const entityKey in entities) {
          repoInstances[entityKey] = args[keyTracker[entityKey]];
        }

        return repoInstances;
      },
      inject: reposToInject,
    };
  }
}
