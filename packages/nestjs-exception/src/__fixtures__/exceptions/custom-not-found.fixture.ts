import { NotFoundException } from '@nestjs/common';
import { ExceptionInterface } from '../../interfaces/exception.interface';
import { formatMessage } from '../../utils/format-message.util';

export class CustomNotFoundException
  extends NotFoundException
  implements ExceptionInterface
{
  errorCode = 'CUSTOM_NOT_FOUND';

  constructor(itemId: number) {
    super(
      NotFoundException.createBody(
        formatMessage('Item with id %d was not found.', itemId),
      ),
    );
  }
}
