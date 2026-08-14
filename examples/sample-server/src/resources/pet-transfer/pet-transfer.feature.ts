import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CqrsModule, CommandBus } from '@nestjs/cqrs';
import { ApiNotFoundResponse } from '@nestjs/swagger';
import {
  getAppContext,
  type OperationContext,
} from '@concepta/rockets-core';
import { command, operationResource } from '@concepta/rockets-core/zod';
import { z } from 'zod';
import type { Pet } from '../pet/pet.schema';
import { TransferPetOwnershipCommand } from './commands/impl/transfer-pet-ownership.command';
import { TransferPetOwnershipHandler } from './commands/handlers/transfer-pet-ownership.handler';

/**
 * HTTP adapter for pet-transfer via {@link operationResource} (issue #43).
 * Dispatches {@link TransferPetOwnershipCommand} — no repository or business
 * logic here. The CQRS handler + event bus stay the source of truth.
 */
@Injectable()
class TransferPetOwnershipHttpHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(
    ctx: OperationContext<{ newOwnerId: string }>,
  ): Promise<Pet> {
    if (ctx.user === undefined) {
      throw new UnauthorizedException();
    }
    const petId = ctx.params.petId;
    const appCtx = getAppContext(ctx.request.raw);
    return this.commandBus.execute(
      new TransferPetOwnershipCommand(
        appCtx,
        petId,
        ctx.user.id,
        ctx.input.newOwnerId,
      ),
    );
  }
}

/**
 * Pet-transfer is a CQRS workflow consumed by an `operationResource` HTTP
 * surface: it uses the pet / share / user repositories already registered
 * elsewhere and emits a domain command — no new tables.
 */
export const petTransferFeature = operationResource({
  path: 'pets/:petId/transfer',
  tags: ['Pet transfer'],
  imports: [CqrsModule],
  providers: [TransferPetOwnershipHandler, TransferPetOwnershipHttpHandler],
  operations: {
    transfer: command({
      summary: 'Transfer pet ownership to another user (owner only)',
      input: z.object({ newOwnerId: z.uuid() }),
      output: z.object({
        id: z.string(),
        userId: z.string(),
      }),
      handler: TransferPetOwnershipHttpHandler,
      decorators: [
        ApiNotFoundResponse({
          description:
            'Pet not found, not owned by you, or target user does not exist',
        }),
      ],
    }),
  },
});
