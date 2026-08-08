import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { UserInterface } from '@concepta/nestjs-user';
import { DomainAggregate } from '@concepta/nestjs-core/aggregate';
import { CreateUserCommand } from '@concepta/nestjs-user';

import { RocketsCreateUserCommand } from '../impl/rockets-create-user.command';

@CommandHandler(RocketsCreateUserCommand)
export class RocketsCreateUserHandler
  implements
    ICommandHandler<
      RocketsCreateUserCommand,
      DomainAggregate<UserInterface> | null
    >
{
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: RocketsCreateUserCommand,
  ): Promise<DomainAggregate<UserInterface> | null> {
    const dto = {
      username: command.data.username ?? command.data.email ?? '',
      email: command.data.email ?? '',
      active: command.data.active,
    };
    return this.commandBus.execute(new CreateUserCommand(command.ctx, dto));
  }
}
