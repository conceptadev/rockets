import { ApiParamOptions } from '@nestjs/swagger';
import { OptionsInterface } from '@concepta/nestjs-common';

export interface CrudApiParamMetadataInterface extends OptionsInterface {
  propertyKey: string | symbol;
  options: ApiParamOptions | undefined;
}
