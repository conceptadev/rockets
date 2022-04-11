import { createFakeConnection } from '@devniel/nestjs-typeorm-testing';
import { FakeConnectionOptions } from '@devniel/nestjs-typeorm-testing/dist/lib/createFakeConnection';

export function createTestConnectionFactory(options: FakeConnectionOptions) {
  return createFakeConnection(options);
}
