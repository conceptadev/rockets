import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
  ModuleOptionsControllerInterface,
  negotiateController,
} from '@concepta/nestjs-common';
import {
  createCustomRepositoryProvider,
  createEntityRepositoryProvider,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { OrgRepository } from './org.repository';
import { orgDefaultConfig } from './config/org-default.config';
import { OrgEntity } from './entities/org.entity';
import { OrgOptionsInterface } from './interfaces/org-options.interface';
import { OrgOrmOptionsInterface } from './interfaces/org-orm-options.interface';
import {
  ORG_MODULE_OPTIONS_TOKEN,
  ORG_MODULE_ORG_ENTITY_REPO_TOKEN,
  ORG_MODULE_ORG_CUSTOM_REPO_TOKEN,
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
  imports: [
    ConfigModule.forFeature(orgDefaultConfig),
    CrudModule.deferred({
      timeoutMessage:
        'OrgModule requires CrudModule to be registered in your application.',
    }),
  ],
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
    createEntityRepositoryProvider(ORG_MODULE_ORG_ENTITY_REPO_TOKEN, 'org'),
    createCustomRepositoryProvider(
      ORG_MODULE_ORG_CUSTOM_REPO_TOKEN,
      'orgRepository',
    ),
  ],
  exports: [ORG_MODULE_ORG_ENTITY_REPO_TOKEN, ORG_MODULE_ORG_CUSTOM_REPO_TOKEN],
}) {
  /**
   * Register the Org module synchronously.
   *
   * @param options module options
   */
  static register(
    options: OrgOptionsInterface &
      OrgOrmOptionsInterface &
      ModuleOptionsControllerInterface = {},
  ) {
    this.configureOrm(options);

    const module = OrgModule.forRoot(OrgModule, options);

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
      OrgOrmOptionsInterface &
      ModuleOptionsControllerInterface,
  ) {
    this.configureOrm(options);

    const module = OrgModule.forRootAsync(OrgModule, {
      useFactory: () => ({}),
      ...options,
    });

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

  /**
   * Statically configure the ORM options.
   *
   * @param options ORM options
   */
  private static configureOrm(options: OrgOrmOptionsInterface) {
    TypeOrmExtModule.configure(options.orm, {
      entities: {
        org: { useClass: OrgEntity },
      },
      repositories: {
        orgRepository: { useClass: OrgRepository },
      },
    });
  }
}
