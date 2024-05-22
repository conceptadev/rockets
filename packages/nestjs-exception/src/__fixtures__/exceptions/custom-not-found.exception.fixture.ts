import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '../../exceptions/runtime.exception';

export class CustomNotFoundExceptionFixture extends RuntimeException {
  httpStatus = HttpStatus.NOT_FOUND;
  errorCode = 'CUSTOM_NOT_FOUND';

  constructor(itemId: number) {
    super({
      message: 'Item with id %d was not found.',
      messageParams: [itemId],
    });
  }
}
