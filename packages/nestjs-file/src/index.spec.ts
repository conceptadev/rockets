import { FileCreateDto, FileDto, FileModule, FileService } from './index';

describe('File Module', () => {
  it('should be a function', () => {
    expect(FileModule).toBeInstanceOf(Function);
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
