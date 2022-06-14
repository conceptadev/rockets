import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { createFakeConnection } from '@devniel/nestjs-typeorm-testing';
import { FakeConnectionOptions } from '@devniel/nestjs-typeorm-testing/dist/lib/createFakeConnection';
import { TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME } from '../typeorm-ext.constants';

export function createTestConnectionFactory(
  options: TypeOrmModuleOptions = {},
) {
  const { type, name, entities, ...rest } = options;

  if (type !== 'postgres') {
    throw new Error('Fake connection only supports the `postgres` driver.');
  }

  const fakeOptions: FakeConnectionOptions = {
    type: 'postgres',
    name: name ?? TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME,
    entities: entities ?? [],
    ...rest,
  };

  if (options) {
    return createFakeConnection(fakeOptions);
  } else {
    throw new Error('Fake connection options are required');
  }
}
