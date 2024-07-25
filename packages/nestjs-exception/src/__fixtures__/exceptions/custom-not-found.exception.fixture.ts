import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '../../exceptions/runtime.exception';

export class CustomNotFoundExceptionFixture extends RuntimeException {
  constructor(itemId: number) {
    super({
      message: 'Item with id %d was not found.',
      messageParams: [itemId],
      httpStatus: HttpStatus.NOT_FOUND,
    });

    this.errorCode = 'CUSTOM_NOT_FOUND';
  }
}
