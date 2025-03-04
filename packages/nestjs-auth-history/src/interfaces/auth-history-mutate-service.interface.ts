import {
  AuthHistoryCreatableInterface,
  CreateOneInterface,
} from '@concepta/nestjs-common';
import { AuthHistoryEntityInterface } from './auth-history-entity.interface';

export interface AuthHistoryMutateServiceInterface
  extends CreateOneInterface<
    AuthHistoryCreatableInterface,
    AuthHistoryEntityInterface
  > {}
