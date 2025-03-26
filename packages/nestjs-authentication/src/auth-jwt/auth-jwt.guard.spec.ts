import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { mock } from 'jest-mock-extended';
import { UserFixture } from '../__fixtures__/user/user.entity.fixture';
import { UserModuleFixture } from '../__fixtures__/user/user.module.fixture';
import { AuthJwtGuard } from './auth-jwt.guard';

describe(AuthJwtGuard, () => {
  let context: ExecutionContext;
  let authJwtGuard: AuthJwtGuard;
  let spyCanActivate: jest.SpyInstance;
  let user: UserFixture;

  beforeEach(async () => {
    context = mock<ExecutionContext>();

    const moduleRef = await Test.createTestingModule({
      imports: [UserModuleFixture],
    }).compile();
    authJwtGuard = moduleRef.get<AuthJwtGuard>(AuthJwtGuard);
    spyCanActivate = jest
      .spyOn(AuthJwtGuard.prototype, 'canActivate')
      .mockImplementation(() => true);
    user = new UserFixture();
    user.id = randomUUID();
  });

  describe(AuthJwtGuard.prototype.canActivate, () => {
    it('should be success', async () => {
      await authJwtGuard.canActivate(context);
      expect(spyCanActivate).toBeCalled();
      expect(spyCanActivate).toBeCalledWith(context);
    });
  });

  describe(AuthJwtGuard.prototype.handleRequest, () => {
    it('should return user', () => {
      const response = authJwtGuard.handleRequest<UserFixture>(undefined, user);
      expect(response?.id).toBe(user.id);
    });
    it('should throw error', () => {
      const error = new Error();
      const t = () => {
        authJwtGuard.handleRequest<UserFixture>(error, user);
      };
      expect(t).toThrow();
    });
    it('should throw error unauthorized', () => {
      const t = () => {
        authJwtGuard.handleRequest(undefined, undefined);
      };
      expect(t).toThrow(UnauthorizedException);
    });
  });
});
