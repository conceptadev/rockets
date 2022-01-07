import { createParamDecorator } from '@nestjs/common';

/**
 * @ParsedRequest() wrapper
 */
import { PARSED_CRUD_REQUEST_KEY } from '@nestjsx/crud/lib/constants';
import { R } from '@nestjsx/crud/lib/crud/reflection.helper';

export const ParsedRequest = createParamDecorator(
  (_, ctx): ParameterDecorator => {
    return R.getContextRequest(ctx)[PARSED_CRUD_REQUEST_KEY];
  },
);
