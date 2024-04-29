import {
  AuthRecoveryModule,
  AuthRecoveryController,
  AuthRecoveryService,
  AuthRecoveryNotificationService,
  AuthRecoveryRecoverLoginDto,
  AuthRecoveryRecoverPasswordDto,
  AuthRecoveryUpdatePasswordDto,
  AuthRecoveryValidatePasscodeDto,
} from './index';

describe('Index', () => {
  it('AuthRecoveryModule should be a function', () => {
    expect(AuthRecoveryModule).toBeInstanceOf(Function);
  });

  it('AuthRecoveryController should be a function', () => {
    expect(AuthRecoveryController).toBeInstanceOf(Function);
  });

  it('AuthRecoveryService should be a function', () => {
    expect(AuthRecoveryService).toBeInstanceOf(Function);
  });

  it('AuthRecoveryNotificationService should be a function', () => {
    expect(AuthRecoveryNotificationService).toBeInstanceOf(Function);
  });

  it('AuthRecoveryRecoverLoginDto should be a function', () => {
    expect(AuthRecoveryRecoverLoginDto).toBeInstanceOf(Function);
  });

  it('AuthRecoveryRecoverPasswordDto should be a function', () => {
    expect(AuthRecoveryRecoverPasswordDto).toBeInstanceOf(Function);
  });

  it('AuthRecoveryUpdatePasswordDto should be a function', () => {
    expect(AuthRecoveryUpdatePasswordDto).toBeInstanceOf(Function);
  });

  it('AuthRecoveryValidatePasscodeDto should be a function', () => {
    expect(AuthRecoveryValidatePasscodeDto).toBeInstanceOf(Function);
  });
});
