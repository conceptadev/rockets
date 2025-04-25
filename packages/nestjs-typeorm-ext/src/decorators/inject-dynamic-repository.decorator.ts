import { Inject } from '@nestjs/common';
import { getDynamicRepositoryToken } from '@concepta/nestjs-common';

export const InjectDynamicRepository = (key: string) => {
  return Inject(getDynamicRepositoryToken(key));
};
