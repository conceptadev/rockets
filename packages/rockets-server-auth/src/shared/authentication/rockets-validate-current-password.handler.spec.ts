/**
 * The upstream spread drops prototype getters; these tests preserve that
 * compatibility constraint and verify Rockets' aggregate normalization.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import {
  PasswordCreationService,
  PasswordStorageService,
  PasswordStrengthService,
  PasswordValidationService,
  PasswordPolicy,
} from '@concepta/nestjs-password';

import {
  RocketsValidateCurrentPasswordCommand,
  RocketsValidateCurrentPasswordHandler,
} from './rockets-validate-current-password.handler';

/**
 * Mimics a credentials aggregate whose password hash is exposed by a getter
 * and `toPlain()`, rather than an own enumerable property.
 */
class AggregateLikeCredential {
  constructor(private readonly _passwordHash: string) {}

  get passwordHash(): string {
    return this._passwordHash;
  }

  toPlain(): { passwordHash: string } {
    return { passwordHash: this._passwordHash };
  }
}

function buildPasswordCreationService(): PasswordCreationService {
  const policy = new PasswordPolicy({
    minPasswordStrength: 0,
    requireCurrentToUpdate: false,
  });
  const storage = new PasswordStorageService();
  const validation = new PasswordValidationService();
  const strength = new PasswordStrengthService(policy);
  return new PasswordCreationService(policy, storage, validation, strength);
}

describe('current-password aggregate compatibility', () => {
  const plainPassword = 'CorrectHorseBatteryStaple1!';
  let service: PasswordCreationService;
  let aggregate: AggregateLikeCredential;

  beforeAll(async () => {
    service = buildPasswordCreationService();
    const stored = await new PasswordStorageService().hash(plainPassword);
    aggregate = new AggregateLikeCredential(stored.passwordHash);
  });

  it('validates a plain password-storage object upstream', async () => {
    const pojo = { passwordHash: aggregate.passwordHash };
    const result = await service.validateCurrent({
      password: plainPassword,
      target: pojo,
    });
    expect(result).toBe(true);
  });

  it('documents the upstream failure for aggregate credential targets', async () => {
    await expect(
      service.validateCurrent({
        password: plainPassword,
        target: aggregate as unknown as { passwordHash: string },
      }),
    ).rejects.toThrow(/data and hash arguments required/);
  });

  it('normalizes aggregate credentials before validation', async () => {
    const handler = new RocketsValidateCurrentPasswordHandler(service);
    const command = new RocketsValidateCurrentPasswordCommand(
      plainPassword,
      aggregate as unknown as { passwordHash: string },
    );
    const result = await handler.execute(command);
    expect(result).toBe(true);
  });

  it('rejects an incorrect password after normalization', async () => {
    const handler = new RocketsValidateCurrentPasswordHandler(service);
    const command = new RocketsValidateCurrentPasswordCommand(
      'totally-wrong-password',
      aggregate as unknown as { passwordHash: string },
    );
    const result = await handler.execute(command);
    expect(result).toBe(false);
  });
});
