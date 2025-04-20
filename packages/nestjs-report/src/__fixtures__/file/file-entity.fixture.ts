import { Entity } from 'typeorm';
import { FileSqliteEntity } from '@concepta/nestjs-file';

@Entity()
export class FileEntityFixture extends FileSqliteEntity {}
