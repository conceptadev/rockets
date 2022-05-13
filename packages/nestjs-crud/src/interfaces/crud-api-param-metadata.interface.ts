import { ApiParamOptions } from '@nestjs/swagger';
import { OptionsInterface } from '@concepta/ts-core';

export interface CrudApiParamMetadataInterface extends OptionsInterface {
  propertyKey: string | symbol;
  options: ApiParamOptions | undefined;
}
