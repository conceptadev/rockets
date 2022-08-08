import { IsOptional, IsString, MinLength } from 'class-validator';
import { AuditEntityUpdatableFixtureInterface } from '../interface/audit.entity.updatable.fixture.interface';

export class AuditEntityUpdateFixtureDto
  implements AuditEntityUpdatableFixtureInterface
{
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;
}
