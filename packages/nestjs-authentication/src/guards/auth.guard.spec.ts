import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyAuthGuard } from './fastify-auth.guard';
import { AuthGuard } from './auth.guard';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn().mockImplementation(() => jest.fn()),
}));
jest.mock('./fastify-auth.guard', () => ({
  FastifyAuthGuard: jest.fn().mockImplementation(() => jest.fn()),
}));

describe('AuthGuard', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it('should use PassportAuthGuard for Express', () => {
    AuthGuard('local');
    expect(PassportAuthGuard).toHaveBeenCalledWith('local');
  });

  it('should always activate if guards are disabled globally', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
    const mockSettings = { enableGuards: false };
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const Guard = AuthGuard('local', { canDisable: true });
    const guardInstance = new Guard(mockSettings, reflector);
    expect(guardInstance.canActivate(mockContext)).toBeTruthy();
  });

  it('should respect disableGuard callback', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const mockSettings = { enableGuards: false };

    const Guard = AuthGuard('local', { canDisable: true });
    const guardInstance = new Guard(mockSettings, reflector);
    expect(guardInstance.canActivate(mockContext)).toBeTruthy();
  });
});
