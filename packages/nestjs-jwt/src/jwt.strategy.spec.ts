import { NotAnErrorException } from '@concepta/ts-core';
import { Request } from 'express-serve-static-core';
import { mock } from 'jest-mock-extended';
import { VerifyCallback } from 'passport-jwt';
import { JwtStrategyOptionsInterface } from './interfaces/jwt-strategy-options.interface';
import { JwtStrategy } from './jwt.strategy';

describe(JwtStrategy, () => {
  let jwtStrategyOptions: JwtStrategyOptionsInterface;
  let verifyCallback: VerifyCallback;
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    jwtStrategyOptions = mock<JwtStrategyOptionsInterface>({
      jwtFromRequest: () => 'rawToken',
      verifyToken: () => true,
    });
    verifyCallback = mock<VerifyCallback>();
    jwtStrategy = new JwtStrategy(jwtStrategyOptions, verifyCallback);
  });

  describe(JwtStrategy.prototype.authenticate, () => {
    let req: Request;
    it('should success', async () => {
      const userResponse = jwtStrategy.authenticate(req);
      expect(userResponse).toBe(true);
    });

    it('should throw exception', async () => {
      jest.spyOn(jwtStrategyOptions, 'jwtFromRequest').mockReturnValue('');
      const t = async () => await jwtStrategy.authenticate(req);
      await expect(t).rejects.toThrow();
    });

    it('should throw exception', async () => {
      jest
        .spyOn(jwtStrategyOptions, 'verifyToken')
        .mockImplementationOnce(() => {
          throw new Error();
        });
      const t = async () => await jwtStrategy.authenticate(req);
      await expect(t).rejects.toThrow();
    });

    it('should throw exception', async () => {
      jest
        .spyOn(jwtStrategyOptions, 'verifyToken')
        .mockImplementationOnce(() => {
          throw new NotAnErrorException(new Error());
        });
      const t = async () => await jwtStrategy.authenticate(req);
      await expect(t).rejects.toThrow();
    });

    it('should throw exception', async () => {
      const t = async () => jwtStrategy['verifyTokenCallback']();
      await expect(t).rejects.toThrow();
    });

    it('should throw exception', async () => {
      const t = async () => jwtStrategy['verifyTokenCallback'](new Error());
      await expect(t).rejects.toThrow();
    });

    // it('should throw exception', async () => {
    //   const t = async () =>
    //     await jwtStrategy['isVerifiedCallback'](new Error(), null, null);
    //   expect(t).rejects.toThrow();
    // });

    // it('should throw exception', async () => {
    //   const t = async () =>
    //     await jwtStrategy['isVerifiedCallback'](null, null, null);
    //   expect(t).rejects.toThrow();
    // });

    // it('should success', async () => {
    //   await jwtStrategy['isVerifiedCallback'](null, {}, {});
    //   expect(1).toBe(1);
    // });
  });
});
