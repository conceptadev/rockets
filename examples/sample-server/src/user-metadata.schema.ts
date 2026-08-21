import { z } from 'zod';
import { auditableEntity, f } from '@concepta/rockets-core/zod';
import { defineUserMetadata } from './zod-bindings';

export const userMetadataSchema = auditableEntity({
  userId: f.string({ max: 255, example: 'user-123' }),
  firstName: f
    .string({ min: 1, max: 100, example: 'John', description: 'User first name' })
    .optional(),
  lastName: f
    .string({ min: 1, max: 100, example: 'Doe', description: 'User last name' })
    .optional(),
  username: f
    .string({ min: 3, max: 50, example: 'johndoe', description: 'Username' })
    .optional(),
  bio: f.string({ max: 500, description: 'User bio', text: true }).optional(),
});

export type UserMetadata = z.infer<typeof userMetadataSchema>;

/**
 * The `{ entity, createDto, updateDto, responseDto }` config for the
 * `userMetadata` slot of `RocketsModule.forRoot`.
 */
export const userMetadataConfig = defineUserMetadata(userMetadataSchema, {
  name: 'UserMetadata',
  table: 'userMetadata',
});

/**
 * Generated classes, re-exported under the historical names so the rest
 * of the app (and the e2e suites) reference them exactly like the old
 * handwritten pair.
 */
export const UserMetadataEntity = userMetadataConfig.entity;
export const UserMetadataCreateDto = userMetadataConfig.createDto;
export const UserMetadataUpdateDto = userMetadataConfig.updateDto;
