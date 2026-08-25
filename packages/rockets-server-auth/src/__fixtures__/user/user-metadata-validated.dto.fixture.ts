import { Expose } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { RocketsAuthUserMetadataDto } from '../../domains/user/infrastructure/dto/rockets-auth-user-metadata.dto';

/**
 * A user-metadata DTO that actually CONSTRAINS its implementation
 * fields — the shape `RocketsAuthUserMetadataDto`'s own docstring
 * prescribes ("implementation-specific fields should be defined in
 * extending classes").
 *
 * Why a fixture is needed at all: the base carries `@Expose()` /
 * `@ApiProperty()` but **zero class-validator metadata**, and
 * `whitelistedFromDto` validates with `forbidUnknownValues: true`.
 * class-validator rejects a metadata-less target outright, so the base
 * does not merely fail to produce findings — it throws
 * `"an unknown value was passed to the validate function"` for EVERY
 * payload, `{}` included. That is issue #103, a real defect in
 * `MeController`, pinned by a regression test in
 * `rockets-auth-error-details.e2e-spec.ts`. This fixture exists to
 * exercise the real `attachErrorDetails` branch, NOT to hide that bug.
 *
 * Constraints are chosen so `plainToInstance`'s
 * `enableImplicitConversion` cannot launder the input into a passing
 * value: a length ceiling and a numeric range still fail on a
 * well-typed value, unlike `@IsString()` against `123` (coerced to
 * `'123'`).
 */
export class UserMetadataValidatedDtoFixture extends RocketsAuthUserMetadataDto {
  @ApiPropertyOptional({ description: 'First name (max 5 chars)' })
  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(5)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Age (0-150)' })
  @Expose()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;
}
