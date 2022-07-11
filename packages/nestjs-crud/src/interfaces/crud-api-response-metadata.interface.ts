import { ApiResponseOptions } from '@nestjs/swagger';
import { CrudActions } from '@nestjsx/crud';

export interface CrudApiResponseMetadataInterface {
  propertyKey: string | symbol;
  action: CrudActions;
  options: ApiResponseOptions | undefined;
}
