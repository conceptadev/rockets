import { Inject } from '@nestjs/common';
import { getEntityRepositoryToken } from '@concepta/nestjs-common';

export const InjectEntityRepository = (key: string) => {
  return Inject(getEntityRepositoryToken(key));
};
