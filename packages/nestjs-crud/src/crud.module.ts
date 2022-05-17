import { Module } from '@nestjs/common';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@concepta/nestjs-core';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  CRUD_MODULE_OPTIONS_TOKEN,
  CRUD_MODULE_SETTINGS_TOKEN,
} from './crud.constants';
import { CrudOptionsInterface } from './interfaces/crud-options.interface';
import { crudDefaultConfig } from './config/crud-default.config';
import { CrudReflectionService } from './services/crud-reflection.service';

@Module({
  providers: [CrudReflectionService],
  exports: [CrudReflectionService],
})
export class CrudModule extends createConfigurableDynamicRootModule<
  CrudModule,
  CrudOptionsInterface
>(CRUD_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(crudDefaultConfig)],
  providers: [
    {
      provide: CRUD_MODULE_SETTINGS_TOKEN,
      inject: [CRUD_MODULE_OPTIONS_TOKEN, crudDefaultConfig.KEY],
      useFactory: async (
        options: CrudOptionsInterface,
        defaultSettings: ConfigType<typeof crudDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
  ],
  exports: [CRUD_MODULE_SETTINGS_TOKEN],
}) {
  static register(options: CrudOptionsInterface = {}) {
    return CrudModule.forRoot(CrudModule, options);
  }

  static registerAsync(options: AsyncModuleConfig<CrudOptionsInterface>) {
    return CrudModule.forRootAsync(CrudModule, {
      useFactory: () => ({}),
      ...options,
    });
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<CrudModule, CrudOptionsInterface>(CrudModule, options);
  }
}
