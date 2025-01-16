import { Factory } from '@concepta/typeorm-seeding';
import { faker } from '@faker-js/faker';
import { AuthHistoryEntityInterface } from './interfaces/auth-history-entity.interface';
/**
 * AuthHistory factory
 */
export class AuthHistoryFactory extends Factory<AuthHistoryEntityInterface> {
  /**
   * Factory callback function.
   */
  protected async entity(
    authHistory: AuthHistoryEntityInterface,
  ): Promise<AuthHistoryEntityInterface> {
    // set random ip address (IPv4 format)
    authHistory.ipAddress = faker.internet.ip();

    // set random auth type
    authHistory.authType = faker.helpers.arrayElement([
      'login',
      'logout',
      'register',
      'password-reset',
    ]);

    // set random device info
    authHistory.deviceInfo = `${faker.helpers.arrayElement([
      'Chrome',
      'Firefox',
      'Safari',
      'Edge',
    ])}}`;

    // return the new authHistory
    return authHistory;
  }
}
