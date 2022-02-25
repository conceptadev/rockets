import { BadRequestException } from '@nestjs/common';
import { CommonExceptionInterface } from '../interfaces/common-exception.interface';
import { RocketsCode, RocketsErrorMessages } from '../constants';

export class BadRequestRocketsException
  extends BadRequestException
  implements CommonExceptionInterface
{
  rocketsCode = RocketsCode.BAD_REQUEST;
  constructor() {
    super(RocketsErrorMessages[RocketsCode.BAD_REQUEST]);
  }
}
