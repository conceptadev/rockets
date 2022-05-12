import { FindConditions, Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ReferenceId } from '@concepta/nestjs-common';
import { ReferenceLookupException } from '@concepta/nestjs-typeorm-ext';
import { ORG_MODULE_ORG_CUSTOM_REPO_TOKEN } from '../org.constants';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';
import { OrgLookupServiceInterface } from '../interfaces/org-lookup-service.interface';

/**
 * Org lookup service
 */
@Injectable()
export class OrgLookupService implements OrgLookupServiceInterface {
  /**
   * Constructor
   *
   * @param orgRepo instance of the org repo
   */
  constructor(
    @Inject(ORG_MODULE_ORG_CUSTOM_REPO_TOKEN)
    private orgRepo: Repository<OrgEntityInterface>,
  ) {}

  /**
   * Get org for the given id.
   *
   * @param id the id
   */
  async byId(id: ReferenceId): Promise<OrgEntityInterface | undefined> {
    return this.findOne({ id });
  }

  /**
   * Find One wrapper.
   *
   * @private
   * @param conditions Find conditions
   */
  protected async findOne(
    conditions?: FindConditions<OrgEntityInterface | undefined>,
  ): Promise<OrgEntityInterface | undefined> {
    try {
      // try to find the org
      return this.orgRepo.findOne(conditions);
    } catch (e) {
      // fatal orm error
      throw new ReferenceLookupException(this.orgRepo.metadata.name, e);
    }
  }
}
