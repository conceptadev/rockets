import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { ORG_MODULE_ORG_CUSTOM_REPO_TOKEN } from '../org.constants';
import { OrgRepository } from '../org.repository';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';

/**
 * User CRUD service
 */
@Injectable()
export class OrgCrudService extends TypeOrmCrudService<OrgEntityInterface> {
  /**
   * Constructor
   *
   * @param orgRepo instance of the user repository.
   */
  constructor(
    @Inject(ORG_MODULE_ORG_CUSTOM_REPO_TOKEN)
    private orgRepo: OrgRepository,
  ) {
    super(orgRepo);
  }
}
