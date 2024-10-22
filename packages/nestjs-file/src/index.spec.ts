import {
  FileCreateDto,
  FileDto,
  FileModule,
  FilePostgresEntity,
  FileService,
  FileSqliteEntity,
} from './index';

describe('File Module', () => {
  it('should be a function', () => {
    expect(FileModule).toBeInstanceOf(Function);
  });
});

describe('File Postgres Entity', () => {
  it('should be a function', () => {
    expect(FilePostgresEntity).toBeInstanceOf(Function);
  });
});

describe('File Sqlite Entity', () => {
  it('should be a function', () => {
    expect(FileSqliteEntity).toBeInstanceOf(Function);
  });
});

describe('File Service', () => {
  it('should be a function', () => {
    expect(FileService).toBeInstanceOf(Function);
  });
});

describe('File Dto', () => {
  it('should be a function', () => {
    expect(FileDto).toBeInstanceOf(Function);
  });
});

describe('File Create Dto', () => {
  it('should be a function', () => {
    expect(FileCreateDto).toBeInstanceOf(Function);
  });
});
