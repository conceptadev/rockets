export { TypeOrmExtModule } from './typeorm-ext.module';
export { TypeOrmExtOptions } from './typeorm-ext.types';

export { TypeOrmExtEntityOptionInterface } from './interfaces/typeorm-ext-entity-options.interface';

export { TypeOrmRepositoryAdapter } from './repository/typeorm-repository.adapter';

// base entities
export { AuditPostgresEntity } from './entities/audit/audit-postgres.entity';
export { AuditSqlLiteEntity } from './entities/audit/audit-sqlite.entity';
export { CommonPostgresEntity } from './entities/common/common-postgres.entity';
export { CommonSqliteEntity } from './entities/common/common-sqlite.entity';

// user entities
export { UserPostgresEntity } from './entities/user/user-postgres.entity';
export { UserSqliteEntity } from './entities/user/user-sqlite.entity';

// user password history entities
export { UserPasswordHistoryPostgresEntity } from './entities/user-password-history/user-password-history-postgres.entity';
export { UserPasswordHistorySqliteEntity } from './entities/user-password-history/user-password-history-sqlite.entity';

// user profile entities
export { UserProfilePostgresEntity } from './entities/user-profile/user-profile-postgres.entity';
export { UserProfileSqliteEntity } from './entities/user-profile/user-profile-sqlite.entity';

// OTP entities
export { OtpPostgresEntity } from './entities/otp/otp-postgres.entity';
export { OtpSqliteEntity } from './entities/otp/otp-sqlite.entity';
// role entities
export { RolePostgresEntity } from './entities/role/role-postgres.entity';
export { RoleSqliteEntity } from './entities/role/role-sqlite.entity';

// role assignment entities
export { RoleAssignmentPostgresEntity } from './entities/role/role-assignment-postgres.entity';
export { RoleAssignmentSqliteEntity } from './entities/role/role-assignment-sqlite.entity';
