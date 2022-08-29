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
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { orgDefaultConfig } from './config/org-default.config';
import { OrgOptionsInterface } from './interfaces/org-options.interface';
import { OrgEntitiesOptionsInterface } from './interfaces/org-entities-options.interface';
import {
  ORG_MODULE_OPTIONS_TOKEN,
  ORG_MODULE_OWNER_LOOKUP_SERVICE,
  ORG_MODULE_SETTINGS_TOKEN,
} from './org.constants';
import { OrgController } from './org.controller';
import { OrgLookupService } from './services/org-lookup.service';
import { OrgCrudService } from './services/org-crud.service';
import { OrgLookupServiceInterface } from './interfaces/org-lookup-service.interface';
import { DefaultOrgLookupService } from './services/default-org-lookup.service';
import { OrgMutateService } from './services/org-mutate.service';
import { DefaultOrgMutateService } from './services/default-org-mutate.service';

/**
 * Org Module
 */
@Module({
  providers: [DefaultOrgLookupService, DefaultOrgMutateService, OrgCrudService],
  exports: [OrgLookupService, OrgMutateService, OrgCrudService],
  controllers: [OrgController],
})
export class OrgModule extends createConfigurableDynamicRootModule<
  OrgModule,
  OrgOptionsInterface
>(ORG_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(orgDefaultConfig), CrudModule],
  providers: [
    {
      provide: ORG_MODULE_SETTINGS_TOKEN,
      inject: [ORG_MODULE_OPTIONS_TOKEN, orgDefaultConfig.KEY],
      useFactory: async (
        options: OrgOptionsInterface,
        defaultSettings: ConfigType<typeof orgDefaultConfig>,
      ) => options.settings ?? defaultSettings,
    },
    {
      provide: OrgLookupService,
      inject: [ORG_MODULE_OPTIONS_TOKEN, DefaultOrgLookupService],
      useFactory: async (
        options: OrgOptionsInterface,
        defaultService: OrgLookupServiceInterface,
      ) => options.orgLookupService ?? defaultService,
    },
    {
      provide: OrgMutateService,
      inject: [ORG_MODULE_OPTIONS_TOKEN, DefaultOrgMutateService],
      useFactory: async (
        options: OrgOptionsInterface,
        defaultService: DefaultOrgMutateService,
      ) => options.orgMutateService ?? defaultService,
    },
    {
      provide: ORG_MODULE_OWNER_LOOKUP_SERVICE,
      inject: [ORG_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: OrgOptionsInterface) =>
        options.ownerLookupService,
    },
  ],
}) {
  /**
   * Register the Org module synchronously.
   *
   * @param options module options
   */
  static register(
    options: OrgOptionsInterface &
      OrgEntitiesOptionsInterface &
      ModuleOptionsControllerInterface,
  ) {
    const module = OrgModule.forRoot(OrgModule, options);

    if (!module?.imports) {
      module.imports = [];
    }

    module.imports.push(TypeOrmExtModule.forFeature(options.entities));

    negotiateController(module, options);

    return module;
  }

  /**
   * Register the Org module asynchronously.
   *
   * @param options module options
   */
  static registerAsync(
    options: AsyncModuleConfig<OrgOptionsInterface> &
      OrgEntitiesOptionsInterface &
      ModuleOptionsControllerInterface,
  ) {
    const module = OrgModule.forRootAsync(OrgModule, options);

    if (!module?.imports) {
      module.imports = [];
    }

    module.imports.push(TypeOrmExtModule.forFeature(options.entities));

    negotiateController(module, options);

    return module;
  }

  /**
   * Expect another module to have registered the Org module.
   *
   * @param options module defer options
   */
  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<OrgModule, OrgOptionsInterface>(OrgModule, options);
  }
}
