import { ApiParamOptions } from '@nestjs/swagger';
import { OptionsInterface } from '@rockts-org/nestjs-common';

export interface CrudApiParamMetadataInterface extends OptionsInterface {
  propertyKey: string | symbol;
  options: ApiParamOptions | undefined;
}
