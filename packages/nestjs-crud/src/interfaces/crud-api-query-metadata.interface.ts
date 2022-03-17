import { ApiQueryOptions } from '@nestjs/swagger';
import { OptionsInterface } from '@rockts-org/nestjs-common';

export interface CrudApiQueryMetadataInterface extends OptionsInterface {
  propertyKey: string | symbol;
  options: ApiQueryOptions[] | undefined;
}
