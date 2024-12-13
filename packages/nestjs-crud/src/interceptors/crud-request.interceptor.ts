import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { CrudRequestInterceptor as xCrudRequestInterceptor } from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';
import { CrudReflectionService } from '../services/crud-reflection.service';
import { CRUD_MODULE_CRUD_REQUEST_KEY } from '../crud.constants';
import { CrudRequestException } from '../exceptions/crud-request.exception';

@Injectable()
export class CrudRequestInterceptor extends xCrudRequestInterceptor {
  constructor(private reflectionService: CrudReflectionService) {
    super();
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();

    try {
      if (!req[CRUD_MODULE_CRUD_REQUEST_KEY]) {
        const options = this.reflectionService.getRequestOptions(
          context.getClass(),
          context.getHandler(),
        );

        const action = this.reflectionService.getAction(context.getHandler());

        const parser = RequestQueryParser.create();

        parser.parseQuery(req.query);

        parser.search = {
          $and: this.getSearch(parser, options, action, req?.params),
        };

        req[CRUD_MODULE_CRUD_REQUEST_KEY] = this.getCrudRequest(
          parser,
          options,
        );
      }

      return next.handle();
    } catch (error) {
      throw new CrudRequestException({
        originalError: error,
      });
    }
  }
}
