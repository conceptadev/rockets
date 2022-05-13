import { ApiQueryOptions } from '@nestjs/swagger';
import { OptionsInterface } from '@concepta/ts-core';

export interface CrudApiQueryMetadataInterface extends OptionsInterface {
  propertyKey: string | symbol;
  options: ApiQueryOptions[] | undefined;
}
