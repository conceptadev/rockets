import { IsOptional, IsString, MinLength } from 'class-validator';
import { AuditEntityCreatableFixtureInterface } from '../interface/audit.entity.creatable.fixture.interface';

export class AuditEntityCreateFixtureDto
  implements AuditEntityCreatableFixtureInterface
{
  @IsString()
  @MinLength(2)
  firstName = '';

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;
}
