import { NotFoundException } from '@nestjs/common';
import {
  RocketsCode,
  CommonExceptionInterface,
} from '@rockts-org/nestjs-common';

export class UserNotFoundException
  extends NotFoundException
  implements CommonExceptionInterface
{
  rocketsCode = RocketsCode.NOT_FOUND;
  constructor(message: string) {
    super(message);
  }
}
