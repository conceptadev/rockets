import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { FederatedCreatableInterface } from '@concepta/ts-common';
import { FederatedDto } from './federated.dto';

/**
 * Federated Create DTO
 */
@Exclude()
export class FederatedCreateDto
  extends PickType(FederatedDto, ['provider', 'subject', 'user'] as const)
  implements FederatedCreatableInterface {}
