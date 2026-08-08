import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { UserInterface } from '@concepta/nestjs-user';
import { DomainAggregate } from '@concepta/nestjs-core/aggregate';
import { UpdateUserCommand } from '@concepta/nestjs-user';

import { RocketsUpdateUserCommand } from '../impl/rockets-update-user.command';

@CommandHandler(RocketsUpdateUserCommand)
export class RocketsUpdateUserHandler
  implements
    ICommandHandler<
      RocketsUpdateUserCommand,
      DomainAggregate<UserInterface> | null
    >
{
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: RocketsUpdateUserCommand,
  ): Promise<DomainAggregate<UserInterface> | null> {
    return this.commandBus.execute(
      new UpdateUserCommand(command.ctx, command.id, command.data),
    );
  }
}
