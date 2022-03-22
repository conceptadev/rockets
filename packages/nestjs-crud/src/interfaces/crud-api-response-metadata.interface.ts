import { ApiResponseOptions } from '@nestjs/swagger';
import { CrudActions } from '@nestjsx/crud';
import { OptionsInterface } from '@concepta/nestjs-common';

export interface CrudApiResponseMetadataInterface extends OptionsInterface {
  propertyKey: string | symbol;
  action: CrudActions;
  options: ApiResponseOptions | undefined;
}
