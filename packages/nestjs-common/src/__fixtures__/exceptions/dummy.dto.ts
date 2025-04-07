import { IsNumber } from 'class-validator';

export class DummyDto {
  @IsNumber()
  id!: number;
}
