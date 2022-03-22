import { ApiQueryOptions } from '@nestjs/swagger';
import { OptionsInterface } from '@concepta/nestjs-common';

export interface CrudApiQueryMetadataInterface extends OptionsInterface {
  propertyKey: string | symbol;
  options: ApiQueryOptions[] | undefined;
}
