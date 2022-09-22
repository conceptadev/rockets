import { mock } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenType } from '../jwt.types';
import { JwtSignService } from './jwt-sign.service';

describe(JwtSignService, () => {
  const token = 'token';
  const access: JwtTokenType = 'access';
  const refresh: JwtTokenType = 'refresh';

  let jwtAccessService: JwtService;
  let jwtRefreshService: JwtService;
  let jwtSignService: JwtSignService;
  beforeEach(() => {
    jwtAccessService = mock<JwtService>();
    jwtRefreshService = mock<JwtService>();
    jwtSignService = new JwtSignService(jwtAccessService, jwtRefreshService);
  });

  describe(JwtSignService.prototype.signAsync, () => {
    it('should success', async () => {
      const spySignAsync = jest
        .spyOn(jwtAccessService, 'signAsync')
        .mockResolvedValue(token);
      const result = await jwtSignService.signAsync(access, token);
      expect(result).toBe(token);
      expect(spySignAsync).toBeCalledWith(token);
    });

    it('should throw error', async () => {
      jest.spyOn(jwtAccessService, 'signAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtSignService.signAsync(access, token);
      expect(t).rejects.toThrowError();
    });
  });

  describe(JwtSignService.prototype.verifyAsync, () => {
    it('should success', async () => {
      const spyVerifyAsync = jest
        .spyOn(jwtAccessService, 'verifyAsync')
        .mockResolvedValue({ token });
      const result = await jwtSignService.verifyAsync(access, token);
      expect(result.token).toBe(token);
      expect(spyVerifyAsync).toBeCalledWith(token);
    });

    it('should throw error', async () => {
      jest.spyOn(jwtAccessService, 'verifyAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtSignService.verifyAsync(access, token);
      expect(t).rejects.toThrowError();
    });
  });

  describe(JwtSignService.prototype.decode, () => {
    it('should success', async () => {
      const spyDecode = jest.spyOn(jwtAccessService, 'decode');
      await jwtSignService.decode(access, token);
      expect(spyDecode).toBeCalledWith(token);
    });

    it('should throw error', async () => {
      jest.spyOn(jwtAccessService, 'decode').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtSignService.decode(access, token);
      expect(t).rejects.toThrowError();
    });
  });

  describe(JwtSignService.prototype['service'], () => {
    it('should get jwtAccessService ', async () => {
      const service = jwtSignService['service'](access);
      expect(service).toBe(jwtAccessService);
    });
    it('should get jwtRefreshService', async () => {
      const service = jwtSignService['service'](refresh);
      expect(service).toBe(jwtRefreshService);
    });
  });
});
