import { LiteralObject } from '@concepta/nestjs-common/src';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ReferenceConstraintsInterface } from '../interfaces/invitation-constraints.interface';

@Exclude()
export class ReferenceConstraintsDto implements ReferenceConstraintsInterface {
  @Expose()
  @ApiPropertyOptional({
    description: 'The constraints of the org',
  })
  constraints?: LiteralObject;
}
