export { TypeOrmExtModule } from './typeorm-ext.module';
export { TypeOrmExtService } from './typeorm-ext.service';
export {
  TypeOrmExtOptions,
  TypeOrmExtMetadataOptions,
} from './typeorm-ext.types';

export { TypeOrmExtOrmOptionsInterface } from './interfaces/typeorm-ext-orm-options.interface';

export { createEntityRepositoryProvider } from './utils/create-custom-entity-provider';
export { createCustomRepositoryProvider } from './utils/create-custom-repository-provider';

// service
export { MutateService } from './services/mutate.service';

// exceptions
export { ReferenceLookupException } from './exceptions/reference-lookup.exception';
export { ReferenceMutateException } from './exceptions/reference-mutate.exception';
export { ReferenceValidationException } from './exceptions/reference-validation.exception';
export { ReferenceIdNoMatchException } from './exceptions/reference-id-no-match.exception';

// base entity
export { AuditPostgresEmbed } from './embeds/audit/audit-postgres.embed';
export { AuditSqlLiteEmbed } from './embeds/audit/audit-sqlite.embed';
