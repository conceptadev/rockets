import { Inject } from '@nestjs/common';
import { getEntityRepositoryToken } from '../utils/get-entity-repository-token';

export const InjectEntityRepository = (key: string) => {
  return Inject(getEntityRepositoryToken(key));
};
