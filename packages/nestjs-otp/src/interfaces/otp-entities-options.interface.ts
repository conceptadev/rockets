import {
  OtpInterface,
  RepositoryEntityOptionInterface,
} from '@concepta/nestjs-common';

export interface OtpEntitiesOptionsInterface
  extends Record<string, RepositoryEntityOptionInterface<OtpInterface>> {}
