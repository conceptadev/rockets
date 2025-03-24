import {
  CanActivate,
  ExecutionContext,
  NotImplementedException,
} from '@nestjs/common';
import { AuthGuardCtr } from '../authentication.types';

export const FastifyAuthGuard = (_strategyName: string): AuthGuardCtr => {
  class FastifyAuthGuard implements CanActivate {
    canActivate(
      _context: ExecutionContext,
    ): ReturnType<CanActivate['canActivate']> {
      throw new NotImplementedException();
    }
  }

  return FastifyAuthGuard;
};
