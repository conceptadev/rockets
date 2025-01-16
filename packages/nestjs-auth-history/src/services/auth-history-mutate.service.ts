import { AuthHistoryCreatableInterface } from '@concepta/nestjs-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { MutateService } from '@concepta/typeorm-common';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { AUTH_HISTORY_MODULE_AUTH_HISTORY_ENTITY_KEY } from '../auth-history.constants';
import { AuthHistoryCreateDto } from '../dto/auth-history-create.dto';
import { AuthHistoryEntityInterface } from '../interfaces/auth-history-entity.interface';
import { AuthHistoryMutateServiceInterface } from '../interfaces/auth-history-mutate-service.interface';

/**
 * AuthHistory mutate service
 */
@Injectable()
export class AuthHistoryMutateService
  extends MutateService<
    AuthHistoryEntityInterface,
    AuthHistoryCreatableInterface,
    AuthHistoryCreatableInterface
  >
  implements AuthHistoryMutateServiceInterface
{
  protected createDto = AuthHistoryCreateDto;
  protected updateDto = AuthHistoryCreateDto;

  constructor(
    @InjectDynamicRepository(AUTH_HISTORY_MODULE_AUTH_HISTORY_ENTITY_KEY)
    repo: Repository<AuthHistoryEntityInterface>,
  ) {
    super(repo);
  }
}
