import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { OrgOwnerLookupServiceInterface } from '../interfaces/org-owner-lookup-service.interface';
import { OwnerEntityFixture } from './owner-entity.fixture';
import { OwnerRepositoryFixture } from './owner-repository.fixture';
import { FindOneOptions } from 'typeorm';

@Injectable()
export class OwnerLookupServiceFixture
  implements OrgOwnerLookupServiceInterface
{
  constructor(
    @InjectDynamicRepository('owner')
    private ownerRepo: OwnerRepositoryFixture,
  ) {}

  byId(id: string): Promise<OwnerEntityFixture | null> {
    return this.ownerRepo.findOne({ id } as FindOneOptions<OwnerEntityFixture>);
  }
}
