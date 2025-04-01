import { mock } from 'jest-mock-extended';
import { ValidateTokenServiceInterface } from '../../core/interfaces/validate-token-service.interface';
import { VerifyTokenService } from './verify-token.service';
import { AuthenticationAccessTokenException } from '../../core/exceptions/authentication-access-token.exception';
import { AuthenticationRefreshTokenException } from '../../core/exceptions/authentication-refresh-token.exception';
import { JwtVerifyTokenService } from './jwt-verify-token.service';

describe(VerifyTokenService, () => {
  const token = 'token';
  let verifyTokenService: VerifyTokenService;

  const jwtVerifyTokenService = mock<JwtVerifyTokenService>();
  const validateTokenService = mock<ValidateTokenServiceInterface>();

  describe(VerifyTokenService.prototype.accessToken, () => {
    it('should success', async () => {
      verifyTokenService = new VerifyTokenService(jwtVerifyTokenService);
      jest.spyOn(jwtVerifyTokenService, 'accessToken').mockResolvedValue({});
      const result = await verifyTokenService.accessToken(token);
      expect(result).toEqual({});
    });

    it('should throw exception', async () => {
      verifyTokenService = new VerifyTokenService(
        jwtVerifyTokenService,
        validateTokenService,
      );
      jest.spyOn(jwtVerifyTokenService, 'accessToken').mockResolvedValue({});
      jest
        .spyOn(validateTokenService, 'validateToken')
        .mockResolvedValue(false);

      const t = async () => {
        await verifyTokenService.accessToken(token);
      };

      await expect(t).rejects.toThrow(AuthenticationAccessTokenException);
    });

    it('should throw exception', async () => {
      verifyTokenService = new VerifyTokenService(
        jwtVerifyTokenService,
        validateTokenService,
      );
      jest.spyOn(jwtVerifyTokenService, 'accessToken').mockResolvedValue({});
      jest
        .spyOn(validateTokenService, 'validateToken')
        .mockResolvedValue(false);

      const t = async () => {
        await verifyTokenService.accessToken(token);
      };

      await expect(t).rejects.toThrow(
        'Access token was verified, but failed further validation.',
      );
    });
  });

  describe(VerifyTokenService.prototype.refreshToken, () => {
    it('should success', async () => {
      verifyTokenService = new VerifyTokenService(jwtVerifyTokenService);
      jest.spyOn(jwtVerifyTokenService, 'refreshToken').mockResolvedValue({});
      const result = await verifyTokenService.refreshToken(token);
      expect(result).toEqual({});
    });

    it('should throw exception', async () => {
      verifyTokenService = new VerifyTokenService(
        jwtVerifyTokenService,
        validateTokenService,
      );
      jest.spyOn(jwtVerifyTokenService, 'refreshToken').mockResolvedValue({});
      jest
        .spyOn(validateTokenService, 'validateToken')
        .mockResolvedValue(false);

      const t = async () => {
        await verifyTokenService.refreshToken(token);
      };
      await expect(t).rejects.toThrow(AuthenticationRefreshTokenException);
    });

    it('should throw exception', async () => {
      verifyTokenService = new VerifyTokenService(
        jwtVerifyTokenService,
        validateTokenService,
      );
      jest.spyOn(jwtVerifyTokenService, 'refreshToken').mockResolvedValue({});
      jest
        .spyOn(validateTokenService, 'validateToken')
        .mockResolvedValue(false);

      const t = async () => {
        await verifyTokenService.refreshToken(token);
      };
      await expect(t).rejects.toThrow(
        'Refresh token was verified, but failed further validation.',
      );
    });
  });
});
