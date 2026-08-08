import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { UserInterface } from '@concepta/nestjs-user';
import { DomainAggregate } from '@concepta/nestjs-core/aggregate';
import { GetUserByUsernameQuery } from '@concepta/nestjs-user';

import { RocketsGetUserByUsernameQuery } from '../impl/rockets-get-user-by-username.query';

@QueryHandler(RocketsGetUserByUsernameQuery)
export class RocketsGetUserByUsernameHandler
  implements
    IQueryHandler<
      RocketsGetUserByUsernameQuery,
      DomainAggregate<UserInterface> | null
    >
{
  constructor(private readonly queryBus: QueryBus) {}

  async execute(
    query: RocketsGetUserByUsernameQuery,
  ): Promise<DomainAggregate<UserInterface> | null> {
    return this.queryBus.execute(
      new GetUserByUsernameQuery(query.ctx, query.username),
    );
  }
}
