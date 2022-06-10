import { IsString } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditDto } from '@concepta/nestjs-common';
import { CrudResponseDto } from '@concepta/nestjs-crud';
import { FederatedInterface } from '../interfaces/federated.interface';

/**
 * Federated DTO
 */
@Exclude()
export class FederatedDto
  extends CrudResponseDto<FederatedInterface>
  implements FederatedInterface
{
  /**
   * Unique id
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Unique identifier',
  })
  @IsString()
  id: ReferenceId = '';

  /**
   * provider
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'provider of the federated',
  })
  @IsString()
  provider = '';

  /**
   * subject
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'subject of the federated',
  })
  @IsString()
  subject = '';

  /**
   * userId
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'userId of the federated',
  })
  @IsString()
  userId = '';

  /**
   * Audit
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: AuditDto,
    description: 'Audit data',
  })
  @Type(() => AuditDto)
  audit: AuditInterface = new AuditDto();
}
