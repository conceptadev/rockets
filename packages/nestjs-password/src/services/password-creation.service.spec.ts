import { mock } from 'jest-mock-extended';

import { PasswordStrengthEnum } from '../enum/password-strength.enum';
import { PasswordOptionsInterface } from '../interfaces/password-options.interface';
import { PasswordCreationService } from './password-creation.service';
import { PasswordStrengthService } from './password-strength.service';

describe('PasswordCreationService', () => {
  const PASSWORD_MEDIUM = 'AS12378';

  let service: PasswordCreationService;
  let passwordStrengthService: PasswordStrengthService;
  let spyIsStrong: jest.SpyInstance;

  const config = {
    maxPasswordAttempts: 5,
    minPasswordStrength: PasswordStrengthEnum.Strong,
  } as PasswordOptionsInterface;

  beforeEach(async () => {
    passwordStrengthService = mock<PasswordStrengthService>();
    spyIsStrong = jest.spyOn(passwordStrengthService, 'isStrong');

    service = new PasswordCreationService(passwordStrengthService, config);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('PasswordCreationService.isStrong', async () => {
    await service.isStrong(PASSWORD_MEDIUM);

    expect(spyIsStrong).toBeCalled();
  });

  it('PasswordCreationService.checkAttempt', () => {
    let canAttemptOneMore = service.checkAttempt(0);
    expect(canAttemptOneMore).toBe(true);

    canAttemptOneMore = service.checkAttempt();
    expect(canAttemptOneMore).toBe(true);

    canAttemptOneMore = service.checkAttempt(1);
    expect(canAttemptOneMore).toBe(true);

    canAttemptOneMore = service.checkAttempt(2);
    expect(canAttemptOneMore).toBe(true);

    canAttemptOneMore = service.checkAttempt(5);
    expect(canAttemptOneMore).toBe(true);

    canAttemptOneMore = service.checkAttempt(6);
    expect(canAttemptOneMore).toBe(false);
  });

  it('PasswordCreationService.checkAttempt', () => {
    let attemptsLeft = service.checkAttemptLeft(1);
    expect(attemptsLeft).toBe(4);

    attemptsLeft = service.checkAttemptLeft(0);
    expect(attemptsLeft).toBe(5);

    attemptsLeft = service.checkAttemptLeft();
    expect(attemptsLeft).toBe(5);

    attemptsLeft = service.checkAttemptLeft(2);
    expect(attemptsLeft).toBe(3);

    attemptsLeft = service.checkAttemptLeft(5);
    expect(attemptsLeft).toBe(0);

    attemptsLeft = service.checkAttemptLeft(6);
    expect(attemptsLeft).toBe(-1);
  });
});
