export { TypeOrmExtModule } from './typeorm-ext.module';
export { TypeOrmExtOptions } from './typeorm-ext.types';

export { TypeOrmExtEntityOptionInterface } from './interfaces/typeorm-ext-entity-options.interface';

export { InjectEntityRepository } from './decorators/inject-entity-repository.decorator';
export { InjectDynamicRepository } from './decorators/inject-dynamic-repository.decorator';

export { TypeOrmRepositoryAdapter } from './repository/typeorm-repository.adapter';

// base entities
export { AuditPostgresEntity } from './entities/audit/audit-postgres.entity';
export { AuditSqlLiteEntity } from './entities/audit/audit-sqlite.entity';
export { CommonPostgresEntity } from './entities/common/common-postgres.entity';
export { CommonSqliteEntity } from './entities/common/common-sqlite.entity';
