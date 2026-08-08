import { QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { UserInterface } from '@concepta/nestjs-user';
import { DomainAggregate } from '@concepta/nestjs-core/aggregate';
import { GetUserByEmailQuery } from '@concepta/nestjs-user';

import { RocketsGetUserByEmailQuery } from '../impl/rockets-get-user-by-email.query';

@QueryHandler(RocketsGetUserByEmailQuery)
export class RocketsGetUserByEmailHandler
  implements
    IQueryHandler<
      RocketsGetUserByEmailQuery,
      DomainAggregate<UserInterface> | null
    >
{
  constructor(private readonly queryBus: QueryBus) {}

  async execute(
    query: RocketsGetUserByEmailQuery,
  ): Promise<DomainAggregate<UserInterface> | null> {
    return this.queryBus.execute(
      new GetUserByEmailQuery(query.ctx, query.email),
    );
  }
}
