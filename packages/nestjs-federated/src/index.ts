export { FederatedModule } from './federated.module';

export { FederatedService } from './services/federated.service';
export { FederatedOAuthService } from './services/federated-oauth.service';

export { FederatedCredentialsInterface } from './interfaces/federated-credentials.interface';
export { FederatedUserModelServiceInterface } from './interfaces/federated-user-model-service.interface';

export { FederatedDto } from './dto/federated.dto';
export { FederatedCreateDto } from './dto/federated-create.dto';
export { FederatedUpdateDto } from './dto/federated-update.dto';

// exceptions
export { FederatedException } from './exceptions/federated.exception';
export { FederatedCreateException } from './exceptions/federated-create.exception';
export { FederatedQueryException } from './exceptions/federated-query.exception';
export { FederatedCreateUserException } from './exceptions/federated-create-user.exception';
export { FederatedUserRelationshipException } from './exceptions/federated-user-relationship.exception';
export { FederatedFindUserException } from './exceptions/federated-find-user.exception';
export { FederatedMissingEntitiesOptionsException } from './exceptions/federated-missing-entities-options.exception';
