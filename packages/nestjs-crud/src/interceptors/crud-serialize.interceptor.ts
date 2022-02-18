import {
  CallHandler,
  ExecutionContext,
  Inject,
  InternalServerErrorException,
  NestInterceptor,
  PlainLiteralObject,
  StreamableFile,
  Type,
} from '@nestjs/common';
import { isFunction, isObject } from '@nestjs/common/utils/shared.utils';
import {
  instanceToPlain,
  plainToInstance,
  ClassTransformOptions,
} from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CRUD_MODULE_SETTINGS_TOKEN } from '../crud.constants';
import { CrudSerializeOptionsInterface } from '../interfaces/crud-serialize-options.interface';
import { CrudSettingsInterface } from '../interfaces/crud-settings.interface';
import { CrudReflectionService } from '../services/crud-reflection.service';

type ResponseType = PlainLiteralObject | Array<PlainLiteralObject>;

export class CrudSerializeInterceptor implements NestInterceptor {
  constructor(
    @Inject(CRUD_MODULE_SETTINGS_TOKEN) private settings: CrudSettingsInterface,
    private reflectionService: CrudReflectionService,
  ) {}

  /**
   * @private
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // get the options
    const options = this.getOptions(context);

    // serialize the response
    return next
      .handle()
      .pipe(map((response: ResponseType) => this.serialize(response, options)));
  }

  /**
   * @private
   */
  protected serialize(
    response: ResponseType,
    options: CrudSerializeOptionsInterface,
  ) {
    // must have a dto type
    if (!isFunction(options.type)) {
      throw new InternalServerErrorException(
        'Impossible to serialize data without a DTO type.',
      );
    }

    // reasons to bail
    if (!isObject(response) || response instanceof StreamableFile) {
      // return response untouched
      return response;
    }

    // convert each object to DTO type, then convert back to plain object
    return Array.isArray(response)
      ? response.map((response) =>
          this.toPlain(
            this.toInstance(options.type, response, options?.toInstanceOptions),
            options?.toPlainOptions,
          ),
        )
      : this.toPlain(
          this.toInstance(options.type, response, options?.toInstanceOptions),
          options?.toPlainOptions,
        );
  }

  protected toInstance(
    type: Type,
    targetObject: object,
    options?: ClassTransformOptions,
  ): object {
    return plainToInstance(type, targetObject, options);
  }

  protected toPlain(instance: object, options?: ClassTransformOptions): object {
    return instanceToPlain(instance, options);
  }

  protected getOptions(
    context: ExecutionContext,
  ): CrudSerializeOptionsInterface {
    // get serialize options
    const options =
      this.reflectionService.getAllSerializeOptions(
        context.getClass(),
        context.getHandler(),
      ) ?? {};

    // is the type missing?
    if (!options?.type) {
      // yes... get the model options
      const modelOptions = this.reflectionService.getAllModelOptions(
        context.getClass(),
        context.getHandler(),
      );
      // set it
      options.type = modelOptions.type;
    }

    return {
      ...options,
      toInstanceOptions: {
        ...(this.settings?.serialize?.toInstanceOptions ?? {}),
        ...(options.toInstanceOptions ?? {}),
      },
      toPlainOptions: {
        ...(this.settings?.serialize?.toPlainOptions ?? {}),
        ...(options.toPlainOptions ?? {}),
      },
    };
  }
}
