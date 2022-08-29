import { AccessControlFilterService } from './access-control-filter-service.interface';
import { Type } from '@nestjs/common';

export interface AccessControlMetadataInterface {
  service?: Type<AccessControlFilterService>;
}
