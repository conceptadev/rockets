import { format } from 'util';
import { NotFoundException } from '@nestjs/common';
import { ExceptionInterface } from '@concepta/ts-core';

export class CustomNotFoundExceptionFixture
  extends NotFoundException
  implements ExceptionInterface
{
  errorCode = 'CUSTOM_NOT_FOUND';

  constructor(itemId: number) {
    super(
      NotFoundException.createBody(
        format('Item with id %d was not found.', itemId),
      ),
    );
  }
}
