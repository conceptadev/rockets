import { Module } from '@nestjs/common';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
} from '@rockts-org/nestjs-common';
import { TypeOrmConfigService } from './typeorm-config.service';
import { TYPEORM_CONFIG_MODULE_OPTIONS_TOKEN } from './typeorm-config.constants';
import { TypeOrmConfigOptions } from './typeorm-config.types';
import { EventModule } from '@rockts-org/nestjs-event';

@Module({
  providers: [TypeOrmConfigService],
  exports: [TypeOrmConfigService],
})
export class TypeOrmConfigModule extends createConfigurableDynamicRootModule<
  TypeOrmConfigModule,
  TypeOrmConfigOptions
>(TYPEORM_CONFIG_MODULE_OPTIONS_TOKEN, {
  imports: [EventModule.deferred()],
  providers: [TypeOrmConfigService],
}) {
  static register(options: TypeOrmConfigOptions) {
    return TypeOrmConfigModule.forRoot(TypeOrmConfigModule, options);
  }

  static registerAsync(options: AsyncModuleConfig<TypeOrmConfigOptions>) {
    return TypeOrmConfigModule.forRootAsync(TypeOrmConfigModule, options);
  }

  static deferred(timeout = 2000) {
    return TypeOrmConfigModule.externallyConfigured(
      TypeOrmConfigModule,
      timeout,
    );
  }
}
