import { ApiQuery } from '@nestjs/swagger';
import { BaseRouteName, CrudActions } from '@nestjsx/crud';
import { Swagger } from '@nestjsx/crud/lib/crud';
import { CrudReflectionService } from '../../services/crud-reflection.service';

/**
 * \@CrudInit() api query decorator.
 */
export const CrudInitApiQuery =
  (): ClassDecorator =>
  (...args: Parameters<ClassDecorator>) => {
    // get the args
    const [classTarget] = args;

    const reflectionService = new CrudReflectionService();

    // get the api query options
    const apiQueryMetadata =
      reflectionService.getApiQueryOptions(classTarget.prototype) ?? [];

    // loop metadatas
    apiQueryMetadata.map((metadata) => {
      // break out the args
      const { propertyKey, options = [] } = metadata;

      // need the descriptor
      const descriptor = Object.getOwnPropertyDescriptor(
        classTarget.prototype,
        propertyKey,
      );

      // sanity check
      if (!descriptor) {
        throw new Error('Did not find property descriptor');
      }

      // get the action
      const action = reflectionService.getAction(
        classTarget.prototype[propertyKey],
      );

      // get the base name
      const basename = mapActionNameToQueryableBaseName(action);

      // get a base name?
      if (basename) {
        // get the request options
        const requestOptions = reflectionService.getRequestOptions(
          classTarget,
          classTarget.prototype[propertyKey],
        );

        // use swagger helper to get the query
        const queryParamsMeta = Swagger.createQueryParamsMeta(
          basename,
          requestOptions,
        );

        // the merged options
        const appliedParamsMap = new Map<string, boolean>();

        // loop all of the options merged together, overrides first
        for (const apiQueryOptions of [...options, ...queryParamsMeta]) {
          // applied yet?
          if (!appliedParamsMap.has(apiQueryOptions.name)) {
            // apply the decorator
            ApiQuery(apiQueryOptions)(
              classTarget.prototype,
              propertyKey,
              descriptor,
            );
            // consider it done
            appliedParamsMap.set(apiQueryOptions.name, true);
          }
        }
      }
    });
  };

/**
 * Map crud action name to queryable base name.
 * @param action - The crud action we are mapping.
 */
function mapActionNameToQueryableBaseName(
  action: CrudActions,
): BaseRouteName | undefined {
  switch (action) {
    case CrudActions.ReadAll:
      return 'getManyBase';
    case CrudActions.ReadOne:
      return 'getOneBase';
    default:
      return undefined;
  }
}
