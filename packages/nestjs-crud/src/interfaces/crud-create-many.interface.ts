import { CreateManyDto } from '@nestjsx/crud';

export interface CrudCreateManyInterface<T = unknown> extends CreateManyDto<T> {
  bulk: T[];
}
