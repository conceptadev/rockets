export { FederatedModule } from './federated.module';
export { FederatedEntityInterface } from './interfaces/federated-entity.interface';

export { FederatedPostgresEntity } from './entities/federated-postgres.entity';
export { FederatedSqliteEntity } from './entities/federated-sqlite.entity';

export { FederatedService } from './services/federated.service';
export { FederatedOAuthService } from './services/federated-oauth.service';

export { FederatedCredentialsInterface } from './interfaces/federated-credentials.interface';
export { FederatedUserLookupServiceInterface } from './interfaces/federated-user-lookup-service.interface';
export { FederatedUserMutateServiceInterface } from './interfaces/federated-user-mutate-service.interface';

export { FederatedDto } from './dto/federated.dto';
export { FederatedCreateDto } from './dto/federated-create.dto';
export { FederatedUpdateDto } from './dto/federated-update.dto';

// exceptions
export { FederatedException } from './exceptions/federated.exception';
export { FederatedCreateException } from './exceptions/federated-create.exception';
export { FederatedQueryException } from './exceptions/federated-query.exception';
export { FederatedMutateCreateUserException } from './exceptions/federated-mutate-create.exception';
export { FederatedUserRelationshipException } from './exceptions/federated-user-relationship.exception';
export { FederatedUserLookupException } from './exceptions/federated-user-lookup.exception';