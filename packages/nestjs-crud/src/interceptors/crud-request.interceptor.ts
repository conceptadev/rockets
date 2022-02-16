import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CrudRequestInterceptor as xCrudRequestInterceptor } from '@nestjsx/crud';
import {
  RequestQueryParser,
  RequestQueryException,
} from '@nestjsx/crud-request';
import { CrudReflectionHelper } from '../util/crud-reflection.helper';
import {
  CRUD_MODULE_CRUD_REQUEST_KEY,
  CRUD_MODULE_SETTINGS_TOKEN,
} from '../crud.constants';
import { CrudSettingsInterface } from '../interfaces/crud-settings.interface';

@Injectable()
export class CrudRequestInterceptor extends xCrudRequestInterceptor {
  private reflectionHelper = new CrudReflectionHelper();

  constructor(
    @Inject(CRUD_MODULE_SETTINGS_TOKEN) private settings: CrudSettingsInterface,
  ) {
    super();
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();

    try {
      if (!req[CRUD_MODULE_CRUD_REQUEST_KEY]) {
        const options = this.reflectionHelper.getRequestOptions(
          context.getClass(),
          context.getHandler(),
        );
        const action = this.reflectionHelper.getAction(context.getHandler());

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
      throw error instanceof RequestQueryException
        ? new BadRequestException(error.message)
        : error;
    }
  }
}
