import { TypeOrmExtConnectionToken } from '../typeorm-ext.types';

export function resolveConnectionName(
  connection: TypeOrmExtConnectionToken,
): string {
  return typeof connection === 'string' ? connection : connection.name;
}
