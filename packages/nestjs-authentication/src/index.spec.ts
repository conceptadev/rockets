import {
  AuthUser,
  AuthPublic,
  AuthenticationJwtResponseDto,
  IssueTokenService,
  VerifyTokenService,
  ValidateUserService,
} from './index';

describe('Authentication Module Exports', () => {
  it('AuthUser should be a function', () => {
    expect(AuthUser).toBeInstanceOf(Function);
  });

  it('AuthPublic should be a function', () => {
    expect(AuthPublic).toBeInstanceOf(Function);
  });

  it('AuthenticationJwtResponseDto should be a function', () => {
    expect(AuthenticationJwtResponseDto).toBeInstanceOf(Function);
  });

  it('IssueTokenService should be a class', () => {
    expect(IssueTokenService).toBeInstanceOf(Function);
  });

  it('VerifyTokenService should be a class', () => {
    expect(VerifyTokenService).toBeInstanceOf(Function);
  });

  it('ValidateUserService should be a class', () => {
    expect(ValidateUserService).toBeInstanceOf(Function);
  });
});

