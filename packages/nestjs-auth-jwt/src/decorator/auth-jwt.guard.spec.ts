import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { mock } from 'jest-mock-extended';
import { UserFixture } from '../__fixtures__/user/user.entity.fixture';
import { UserModuleFixture } from '../__fixtures__/user/user.module.fixture';
import { JwtAuthGuard } from './auth-jwt.guard';

describe(JwtAuthGuard, () => {
  let context: ExecutionContext;
  let jwtAuthGuard: JwtAuthGuard;
  let spyCanActivate: jest.SpyInstance;
  let user: UserFixture;

  beforeEach(async () => {
    context = mock<ExecutionContext>();

    const moduleRef = await Test.createTestingModule({
      imports: [UserModuleFixture],
    }).compile();
    jwtAuthGuard = moduleRef.get<JwtAuthGuard>(JwtAuthGuard);
    spyCanActivate = jest
      .spyOn(JwtAuthGuard.prototype, 'canActivate')
      .mockImplementation(() => true);
    user = new UserFixture();
    user.id = randomUUID();
  });

  describe(JwtAuthGuard.prototype.canActivate, () => {
    it('should be success', async () => {
      await jwtAuthGuard.canActivate(context);
      expect(spyCanActivate).toBeCalled();
      expect(spyCanActivate).toBeCalledWith(context);
    });
  });

  describe(JwtAuthGuard.prototype.handleRequest, () => {
    it('should return user', () => {
      const response = jwtAuthGuard.handleRequest<UserFixture>(undefined, user);
      expect(response?.id).toBe(user.id);
    });
    it('should throw error', () => {
      const error = new Error();
      const t = () => {
        jwtAuthGuard.handleRequest<UserFixture>(error, user);
      };
      expect(t).toThrow();
    });
    it('should throw error unauthorized', () => {
      const t = () => {
        jwtAuthGuard.handleRequest(undefined, undefined);
      };
      expect(t).toThrow(UnauthorizedException);
    });
  });
});
