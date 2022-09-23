// interfaces
export { QueryOptionsInterface } from './interfaces/query-options.interface';
export { SafeTransactionOptionsInterface } from './interfaces/safe-transaction-options.interface';

// types
export { RunInTransactionCallback } from './typeorm-common.types';

// services
export { BaseService } from './services/base.service';
export { LookupService } from './services/lookup.service';
export { MutateService } from './services/mutate.service';

// exceptions
export { ReferenceLookupException } from './exceptions/reference-lookup.exception';
export { ReferenceMutateException } from './exceptions/reference-mutate.exception';
export { ReferenceValidationException } from './exceptions/reference-validation.exception';
export { ReferenceIdNoMatchException } from './exceptions/reference-id-no-match.exception';

// base entity
export { AuditPostgresEmbed } from './embeds/audit/audit-postgres.embed';
export { AuditSqlLiteEmbed } from './embeds/audit/audit-sqlite.embed';

// proxies
export { EntityManagerProxy } from './proxies/entity-manager.proxy';
export { RepositoryProxy } from './proxies/repository.proxy';
export { TransactionProxy } from './proxies/transaction.proxy';

// testing
export { createEntityManagerMock } from './testing/utils/create-entity-manager.mock';
