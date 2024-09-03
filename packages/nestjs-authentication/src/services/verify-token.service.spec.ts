import { JwtVerifyService } from '@concepta/nestjs-jwt';
import { BadRequestException } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import { ValidateTokenServiceInterface } from '../interfaces/validate-token-service.interface';
import { VerifyTokenService } from './verify-token.service';

describe(VerifyTokenService, () => {
  const token = 'token';
  let verifyTokenService: VerifyTokenService;

  const jwtVerifyService = mock<JwtVerifyService>();
  const validateTokenService = mock<ValidateTokenServiceInterface>();

  describe(VerifyTokenService.prototype.accessToken, () => {
    it('should success', async () => {
      verifyTokenService = new VerifyTokenService(jwtVerifyService);
      jest.spyOn(jwtVerifyService, 'accessToken').mockResolvedValue({});
      const result = await verifyTokenService.accessToken(token);
      expect(result).toEqual({});
    });

    it('should throw exception', async () => {
      verifyTokenService = new VerifyTokenService(
        jwtVerifyService,
        validateTokenService,
      );
      jest.spyOn(jwtVerifyService, 'accessToken').mockResolvedValue({});
      jest
        .spyOn(validateTokenService, 'validateToken')
        .mockResolvedValue(false);

      const t = async () => {
        await verifyTokenService.accessToken(token);
      };

      await expect(t).rejects.toThrow(BadRequestException);
    });
  });

  describe(VerifyTokenService.prototype.refreshToken, () => {
    it('should success', async () => {
      verifyTokenService = new VerifyTokenService(jwtVerifyService);
      jest.spyOn(jwtVerifyService, 'refreshToken').mockResolvedValue({});
      const result = await verifyTokenService.refreshToken(token);
      expect(result).toEqual({});
    });

    it('should throw exception', async () => {
      verifyTokenService = new VerifyTokenService(
        jwtVerifyService,
        validateTokenService,
      );
      jest.spyOn(jwtVerifyService, 'refreshToken').mockResolvedValue({});
      jest
        .spyOn(validateTokenService, 'validateToken')
        .mockResolvedValue(false);

      const t = async () => {
        await verifyTokenService.refreshToken(token);
      };
      await expect(t).rejects.toThrow(BadRequestException);
    });
  });
});
