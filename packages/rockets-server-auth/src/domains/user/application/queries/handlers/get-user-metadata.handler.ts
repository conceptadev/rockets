import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { GetUserMetadataQuery } from '../impl/get-user-metadata.query';
import { UserMetadataRepositoryInterface } from '../../../domain/repositories/user-metadata-repository.interface';
import { USER_METADATA_REPOSITORY_TOKEN } from '../../../domain/constants/user-domain.tokens';
import { RocketsAuthUserMetadataEntityInterface } from '../../../interfaces/rockets-auth-user-metadata-entity.interface';

@QueryHandler(GetUserMetadataQuery)
export class GetUserMetadataHandler
  implements
    IQueryHandler<
      GetUserMetadataQuery,
      RocketsAuthUserMetadataEntityInterface | null
    >
{
  constructor(
    @Inject(USER_METADATA_REPOSITORY_TOKEN)
    private readonly metadataRepository: UserMetadataRepositoryInterface,
  ) {}

  async execute(
    query: GetUserMetadataQuery,
  ): Promise<RocketsAuthUserMetadataEntityInterface | null> {
    return this.metadataRepository.findByUserId(query.ctx, query.userId);
  }
}
