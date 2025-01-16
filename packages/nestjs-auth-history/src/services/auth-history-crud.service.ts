import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { AUTH_HISTORY_MODULE_AUTH_HISTORY_ENTITY_KEY } from '../auth-history.constants';
import { AuthHistoryEntityInterface } from '../interfaces/auth-history-entity.interface';

/**
 * AuthHistory CRUD service
 */
@Injectable()
export class AuthHistoryCrudService extends TypeOrmCrudService<AuthHistoryEntityInterface> {
  /**
   * Constructor
   *
   * @param authHistoryRepo - instance of the login history repository.
   */
  constructor(
    @InjectDynamicRepository(AUTH_HISTORY_MODULE_AUTH_HISTORY_ENTITY_KEY)
    protected readonly authHistoryRepo: Repository<AuthHistoryEntityInterface>,
  ) {
    super(authHistoryRepo);
  }
}
