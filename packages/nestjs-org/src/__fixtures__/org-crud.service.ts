import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-common';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { ORG_MODULE_ORG_ENTITY_KEY } from '../org.constants';
import { OrgEntityInterface } from '@concepta/nestjs-common';

/**
 * Org CRUD service
 */
@Injectable()
export class OrgCrudService extends TypeOrmCrudService<OrgEntityInterface> {
  /**
   * Constructor
   *
   * @param orgRepo - instance of the org repository.
   */
  constructor(
    @InjectDynamicRepository(ORG_MODULE_ORG_ENTITY_KEY)
    orgRepo: Repository<OrgEntityInterface>,
  ) {
    super(orgRepo);
  }
}
