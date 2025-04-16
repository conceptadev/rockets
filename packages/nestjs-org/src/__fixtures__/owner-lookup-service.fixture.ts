import { Injectable } from '@nestjs/common';
import { RepositoryInterface } from '@concepta/nestjs-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { OrgOwnerLookupServiceInterface } from '../interfaces/org-owner-lookup-service.interface';
import { OwnerEntityFixture } from './owner-entity.fixture';

@Injectable()
export class OwnerLookupServiceFixture
  implements OrgOwnerLookupServiceInterface
{
  constructor(
    @InjectDynamicRepository('owner')
    private repo: RepositoryInterface<OwnerEntityFixture>,
  ) {}

  byId(id: string): Promise<OwnerEntityFixture | null> {
    return this.repo.findOne({ where: { id } });
  }
}
