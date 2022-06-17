import { randomUUID, RandomUUIDOptions } from 'crypto';
import { OtpTypeServiceInterface } from '../interfaces/otp-types-service.interface';

export class OtpUtils implements OtpTypeServiceInterface {
  generator(...args: RandomUUIDOptions[]): string {
    return randomUUID(...args);
  }

  validator(a: unknown, b: unknown): boolean {
    return a === b;
  }
}
