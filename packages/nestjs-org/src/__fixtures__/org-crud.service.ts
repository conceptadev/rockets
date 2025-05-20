import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { OrgEntityInterface } from '@concepta/nestjs-common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgEntityFixture } from './org-entity.fixture';

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
    @InjectRepository(OrgEntityFixture)
    orgRepo: Repository<OrgEntityInterface>,
  ) {
    super(orgRepo);
  }
}
