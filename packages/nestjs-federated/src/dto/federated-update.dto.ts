import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { FederatedUpdatableInterface } from '@concepta/nestjs-common';
import { FederatedDto } from './federated.dto';

/**
 * Federated Update DTO
 */
@Exclude()
export class FederatedUpdateDto
  extends PickType(FederatedDto, ['id', 'provider', 'subject'] as const)
  implements FederatedUpdatableInterface {}
