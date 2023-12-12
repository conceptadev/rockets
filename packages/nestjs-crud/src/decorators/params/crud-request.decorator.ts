import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CrudRequestInterface } from '../../interfaces/crud-request.interface';
import { CRUD_MODULE_CRUD_REQUEST_KEY } from '../../crud.constants';

/**
 * @CrudRequest() parameter decorator
 */
export const CrudRequest = createParamDecorator<CrudRequestInterface>(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[CRUD_MODULE_CRUD_REQUEST_KEY];
  },
);
