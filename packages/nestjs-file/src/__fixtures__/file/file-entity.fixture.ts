import { Entity } from 'typeorm';
import { FileSqliteEntity } from '../../entities/file-sqlite.entity';

@Entity()
export class FileEntityFixture extends FileSqliteEntity {}
