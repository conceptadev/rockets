import type { RocketsUserMetadataConfig } from '../../domain/interfaces/rockets-user-metadata-config.interface';
import {
  assertFailClosedResponse,
  assertNamedSchema,
} from '../../common/utils/open-api-schema.util';

/**
 * Runtime checks for `extras.userMetadata` before wiring repositories and
 * the `/me` routes.
 */
export function validateRocketsUserMetadataConfig(
  config: RocketsUserMetadataConfig,
): void {
  if (!config.entity || typeof config.entity !== 'function') {
    throw new Error(
      'RocketsUserMetadataConfig: `entity` must be a class constructor.',
    );
  }
  assertNamedSchema(
    config.updateSchema,
    'RocketsUserMetadataConfig: `updateSchema`',
  );
  assertNamedSchema(
    config.responseSchema,
    'RocketsUserMetadataConfig: `responseSchema`',
  );
  assertFailClosedResponse(
    config.responseSchema,
    'RocketsUserMetadataConfig: `responseSchema`',
  );
}
