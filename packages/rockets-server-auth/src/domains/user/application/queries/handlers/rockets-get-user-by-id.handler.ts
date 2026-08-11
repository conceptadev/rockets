import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { UserInterface } from '@concepta/nestjs-user';
import { DomainAggregate } from '@concepta/nestjs-core/aggregate';
import { GetUserQuery } from '@concepta/nestjs-user';

import { RocketsGetUserByIdQuery } from '../impl/rockets-get-user-by-id.query';

@QueryHandler(RocketsGetUserByIdQuery)
export class RocketsGetUserByIdHandler
  implements
    IQueryHandler<
      RocketsGetUserByIdQuery,
      DomainAggregate<UserInterface> | null
    >
{
  constructor(private readonly queryBus: QueryBus) {}

  async execute(
    query: RocketsGetUserByIdQuery,
  ): Promise<DomainAggregate<UserInterface> | null> {
    return this.queryBus.execute(new GetUserQuery(query.ctx, query.id));
  }
}
