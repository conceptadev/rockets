import { Entity } from 'typeorm';
import { FileSqliteEntity } from '@concepta/nestjs-typeorm-ext';

@Entity()
export class FileEntityFixture extends FileSqliteEntity {}
