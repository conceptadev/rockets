import { HttpStatus, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiResponseMetadata,
  ApiResponseOptions,
  ApiResponseSchemaHost,
  getSchemaPath,
} from '@nestjs/swagger';
import { CrudActions } from '@nestjsx/crud';
import { CrudResponsePaginatedDto } from '../../dto/crud-response-paginated.dto';
import { CrudResponseDto } from '../../dto/crud-response.dto';
import { CrudReflectionService } from '../../services/crud-reflection.service';

type ResponseDecoratorParameters = [
  Type,
  Parameters<MethodDecorator>[1],
  Parameters<MethodDecorator>[2],
];

/**
 * Utility decorator used to apply response
 * options *from the controller context*.
 *
 * DO NOT USE THIS DIRECTLY ON METHODS!!!
 */
export function applyApiResponse(
  action: CrudActions,
  options: ApiResponseOptions,
): MethodDecorator {
  return (...args: ResponseDecoratorParameters) => {
    // break out args
    const [target, propertyKey] = args;

    // reflection service
    const reflectionService = new CrudReflectionService();

    // get the serialize options
    const serializeOptions = reflectionService.getAllSerializationOptions(
      target,
      target.prototype[propertyKey],
    );

    // get the request options
    const requestOptions = reflectionService.getRequestOptions(
      target,
      target.prototype[propertyKey],
    );

    // determine the dto type
    const dto =
      serializeOptions?.type ?? requestOptions.model.type ?? CrudResponseDto;

    // determine pagination dto
    const paginatedDto =
      serializeOptions?.paginatedType ??
      requestOptions.model.paginatedType ??
      CrudResponsePaginatedDto;

    // dto meta options
    const dtoMetaOptions: ApiResponseMetadata = {};

    // dto schema options
    const dtoSchemaOptions: ApiResponseSchemaHost = { schema: undefined };

    // action is the discriminator
    switch (action) {
      // read all
      case CrudActions.ReadAll:
        // is pagination forced?
        if (requestOptions.query.alwaysPaginate) {
          // yes, use paginated type
          dtoMetaOptions.description = `${CrudActions.ReadAll} ${requestOptions.model.type.name} as paginated response`;
          dtoMetaOptions.type = serializeOptions.paginatedType;
        } else {
          // no, could be pagination OR array
          dtoSchemaOptions.description = `${CrudActions.ReadAll} ${requestOptions.model.type.name} as array or paginated response.`;
          dtoSchemaOptions.schema = {
            oneOf: [
              {
                $ref: getSchemaPath(paginatedDto),
              },
              {
                type: 'array',
                items: {
                  $ref: getSchemaPath(dto),
                },
              },
            ],
          };
        }
        break;

      // create many
      case CrudActions.CreateMany:
        dtoSchemaOptions.schema = {
          type: 'array',
          items: { $ref: getSchemaPath(dto) },
        };
        break;

      // returns deleted item or empty
      case CrudActions.DeleteOne:
        dtoMetaOptions.type =
          requestOptions.routes.deleteOneBase.returnDeleted === true
            ? dto
            : undefined;
        break;

      // returns recovered item or empty
      case CrudActions.RecoverOne:
        dtoMetaOptions.type =
          requestOptions.routes.recoverOneBase.returnRecovered === true
            ? dto
            : undefined;
        break;

      // returns one item
      case CrudActions.ReadOne:
      case CrudActions.CreateOne:
      case CrudActions.UpdateOne:
      case CrudActions.ReplaceOne:
      default:
        dtoMetaOptions.type = dto;
        break;
    }

    // merge the options
    const mergedOptions: ApiResponseOptions = {
      status: HttpStatus.OK,
      description: `${action} ${requestOptions.model.type.name}`,
      ...dtoMetaOptions,
      ...dtoSchemaOptions,
      ...options,
    };

    ApiExtraModels(paginatedDto)(...args);
    ApiResponse(mergedOptions)(...args);
  };
}
