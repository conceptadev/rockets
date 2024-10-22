import { Global, Module } from '@nestjs/common';
import { AwsStorageService } from './aws-storage.service';

@Global()
@Module({
  providers: [AwsStorageService],
  exports: [AwsStorageService],
})
export class FileStorageModuleFixture {}
