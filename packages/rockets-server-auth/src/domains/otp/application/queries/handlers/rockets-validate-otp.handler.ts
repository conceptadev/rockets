import {
  QueryHandler,
  IQueryHandler,
  QueryBus,
  CommandBus,
} from '@nestjs/cqrs';
import { AssigneeRelationInterface } from '@concepta/nestjs-core';
import { ValidateOtpQuery, ConsumeOtpCommand } from '@concepta/nestjs-otp';
import { RocketsValidateOtpQuery } from '../impl/rockets-validate-otp.query';

@QueryHandler(RocketsValidateOtpQuery)
export class RocketsValidateOtpHandler
  implements
    IQueryHandler<RocketsValidateOtpQuery, AssigneeRelationInterface | null>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    query: RocketsValidateOtpQuery,
  ): Promise<AssigneeRelationInterface | null> {
    const namespace = String(query.assignment);
    const otp = {
      category: query.otp.category,
      passcode: query.otp.passcode,
    };

    // When the passcode must be burned, ConsumeOtpCommand is the single
    // decision point (validate+remove in one handler). Avoid a prior
    // ValidateOtpQuery — that opens an application-level TOCTOU window.
    // DB-level single-winner still depends on upstream nestjs-otp locking.
    if (query.deleteIfValid) {
      return this.commandBus.execute<
        ConsumeOtpCommand,
        AssigneeRelationInterface | null
      >(new ConsumeOtpCommand(query.ctx, namespace, otp));
    }

    return this.queryBus.execute<
      ValidateOtpQuery,
      AssigneeRelationInterface | null
    >(new ValidateOtpQuery(query.ctx, namespace, otp));
  }
}
