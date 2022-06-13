import { TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME } from '../typeorm-ext.constants';
import { TypeOrmExtConnectionToken } from '../typeorm-ext.types';

export function resolveConnectionName(
  connection: TypeOrmExtConnectionToken,
): string {
  return typeof connection === 'string'
    ? connection
    : connection.name ?? TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME;
}
