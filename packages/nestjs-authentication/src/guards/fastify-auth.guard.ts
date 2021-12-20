import {
  createParamDecorator,
  ExecutionContext,
  NotImplementedException,
} from '@nestjs/common';

export const FastifyAuthGuard = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    // TODO: Add Fastify integration for passport logic
    throw new NotImplementedException();
  },
);
