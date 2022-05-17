import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { ORG_MODULE_ORG_CUSTOM_REPO_TOKEN } from '../org.constants';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';

/**
 * Org CRUD service
 */
@Injectable()
export class OrgCrudService extends TypeOrmCrudService<OrgEntityInterface> {
  /**
   * Constructor
   *
   * @param orgRepo instance of the org repository.
   */
  constructor(
    @Inject(ORG_MODULE_ORG_CUSTOM_REPO_TOKEN)
    orgRepo: Repository<OrgEntityInterface>,
  ) {
    super(orgRepo);
  }
}
