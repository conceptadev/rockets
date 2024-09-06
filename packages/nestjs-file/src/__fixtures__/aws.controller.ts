import { FileService } from '../services/file.service';
import { FileCreateDto } from '../dto/file-create.dto';

export class AwsController {
  constructor(private fileService: FileService) {}

  async create(fileDto: FileCreateDto) {
    return this.fileService.push({
      ...fileDto,
      serviceKey: 'my-aws-storage',
    });
  }

  async get(fileId: string) {
    return this.fileService.fetch({
      id: fileId,
    });
  }
}
