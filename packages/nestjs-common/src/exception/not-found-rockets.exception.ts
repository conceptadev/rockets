import { NotFoundException } from '@nestjs/common';
import { CommonExceptionInterface } from '../interfaces/common-exception.interface';
import { RocketsCode, RocketsErrorMessages } from '../constants';

export class NotFoundRocketsException
  extends NotFoundException
  implements CommonExceptionInterface
{
  rocketsCode = RocketsCode.NOT_FOUND;
  constructor() {
    super(RocketsErrorMessages[RocketsCode.NOT_FOUND]);
  }
}
