import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { FederatedUpdatableInterface } from '../interfaces/federated-updatable.interface';
import { FederatedDto } from './federated.dto';

/**
 * Federated Update DTO
 */
@Exclude()
export class FederatedUpdateDto
  extends PickType(FederatedDto, ['provider', 'subject'] as const)
  implements FederatedUpdatableInterface {}
