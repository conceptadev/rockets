// DTOs
export { AuditDto } from './audit/dto/audit.dto';
export { CommonEntityDto } from './common/dto/common-entity.dto';
export { ReferenceIdDto } from './reference/dto/reference-id.dto';

// Decorators
export { AuthUser } from './decorators/auth-user.decorator';

// Module utilities
export { createSettingsProvider } from './modules/utils/create-settings-provider';

// Module interfaces
export { ModuleOptionsControllerInterface } from './modules/interfaces/module-options-controller.interface';
export { ModuleOptionsSettingsInterface } from './modules/interfaces/module-options-settings.interface';

// Domain exports
export * from './domain';

// Core types & exceptions
export { ExceptionContext } from './core.types';
export { ExceptionInterface } from './exceptions/interfaces/exception.interface';
export { NotAnErrorException } from './exceptions/not-an-error.exception';

// Utility types and functions
export { LiteralObject } from './utils/interfaces/literal-object.interface';
export { Type } from './utils/interfaces/type.interface';
export { mapNonErrorToException } from './utils/map-non-error-to-exception.util';

// Reference types
export {
  ReferenceActive,
  ReferenceAssignment,
  ReferenceEmail,
  ReferenceId,
  ReferenceSubject,
  ReferenceUsername,
} from './reference/interfaces/reference.types';

// Reference interfaces
export { ReferenceActiveInterface } from './reference/interfaces/reference-active.interface';
export { ReferenceAssigneeInterface } from './reference/interfaces/reference-assignee.interface';
export { ReferenceEmailInterface } from './reference/interfaces/reference-email.interface';
export { ReferenceIdInterface } from './reference/interfaces/reference-id.interface';
export { ReferenceQueryOptionsInterface } from './reference/interfaces/reference-query-options.interface';
export { ReferenceSubjectInterface } from './reference/interfaces/reference-subject.interface';
export { ReferenceUsernameInterface } from './reference/interfaces/reference-username.interface';
export { ReferenceUserInterface } from './reference/interfaces/reference-user.interface';
export { ReferenceRoleInterface } from './reference/interfaces/reference-role.interface';
export { ReferenceRolesInterface } from './reference/interfaces/reference-roles.interface';

// role interface
export { RoleAssignmentInterface } from './domain/role/interfaces/role-assignment.interface';
export { RoleAssignmentCreatableInterface } from './domain/role/interfaces/role-assignment-creatable.interface';
export { RoleAssigneesInterface } from './domain/role/interfaces/role-assignees.interface';

// Lookup interfaces
export { LookupEmailInterface } from './reference/interfaces/lookup/lookup-email.interface';
export { LookupIdInterface } from './reference/interfaces/lookup/lookup-id.interface';
export { LookupSubjectInterface } from './reference/interfaces/lookup/lookup-subject.interface';
export { LookupUsernameInterface } from './reference/interfaces/lookup/lookup-username.interface';

// Mutation interfaces
export { CreateOneInterface } from './reference/interfaces/mutate/create-one.interface';
export { RemoveOneInterface } from './reference/interfaces/mutate/remove-one.interface';
export { ReplaceOneInterface } from './reference/interfaces/mutate/replace-one.interface';
export { UpdateOneInterface } from './reference/interfaces/mutate/update-one.interface';

// Audit types
export {
  AuditDateCreated,
  AuditDateDeleted,
  AuditDateUpdated,
  AuditVersion,
} from './audit/interfaces/audit.types';

// Audit interfaces
export { AuditDateCreatedInterface } from './audit/interfaces/audit-date-created.interface';
export { AuditDateDeletedInterface } from './audit/interfaces/audit-date-deleted.interface';
export { AuditDateUpdatedInterface } from './audit/interfaces/audit-date-updated.interface';
export { AuditVersionInterface } from './audit/interfaces/audit-version.interface';
export { AuditInterface } from './audit/interfaces/audit.interface';

// exception types
export { RuntimeExceptionContext } from './exceptions/exception.types';

// filters
export { ExceptionsFilter } from './filters/exceptions.filter';

// exception interfaces
export { RuntimeExceptionOptions } from './exceptions/interfaces/runtime-exception-options.interface';
export { RuntimeExceptionInterface } from './exceptions/interfaces/runtime-exception.interface';

// exceptions
export { RuntimeException } from './exceptions/runtime.exception';

// utils
export { mapHttpStatus } from './utils/map-http-status.util';
