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
import { CrudResponseDto } from '../dto/crud-response.dto';
import { CrudResponsePaginatedDto } from '../dto/crud-response-paginated.dto';
import { CrudSerializationOptionsInterface } from '../interfaces/crud-serialization-options.interface';
import { CrudResultPaginatedInterface } from '../interfaces/crud-result-paginated.interface';
import { CrudSettingsInterface } from '../interfaces/crud-settings.interface';
import { CrudReflectionService } from '../services/crud-reflection.service';
import { IdentityInterface } from '@concepta/nestjs-common';

type ResponseType =
  | (PlainLiteralObject & CrudResultPaginatedInterface<IdentityInterface>)
  | Array<PlainLiteralObject>;

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
    options: CrudSerializationOptionsInterface,
  ) {
    // must have a dto type
    if (!isFunction(options.type)) {
      // this should never happen, but needed just in
      // case somebody removes the defaults
      throw new InternalServerErrorException(
        'Impossible to serialize data without a DTO type.',
      );
    }

    // reasons to bail
    if (!isObject(response) || response instanceof StreamableFile) {
      // return response untouched
      return response;
    }

    // determine the type to use
    const type =
      !Array.isArray(response) && response?.__isPaginated === true
        ? options.paginatedType
        : options.type;

    // convert each object to DTO type, then convert back to plain object
    return this.toPlain(
      this.toInstance(type, response, options?.toInstanceOptions),
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
  ): CrudSerializationOptionsInterface {
    // get serialization options
    const options =
      this.reflectionService.getAllSerializationOptions(
        context.getClass(),
        context.getHandler(),
      ) ?? {};

    // get model options
    const modelOptions = this.reflectionService.getAllModelOptions(
      context.getClass(),
      context.getHandler(),
    );

    // is the type missing?
    if (!options?.type) {
      // yes, set it
      options.type = modelOptions.type ?? CrudResponseDto;
    }

    // is the many type missing?
    if (!options?.paginatedType) {
      // yes, set it
      options.paginatedType =
        modelOptions.paginatedType ?? CrudResponsePaginatedDto;
    }

    return {
      ...options,
      toInstanceOptions: {
        ...(this.settings?.serialization?.toInstanceOptions ?? {}),
        ...(options.toInstanceOptions ?? {}),
      },
      toPlainOptions: {
        ...(this.settings?.serialization?.toPlainOptions ?? {}),
        ...(options.toPlainOptions ?? {}),
      },
    };
  }
}
