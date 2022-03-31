import { ReferenceIdInterface } from '@concepta/nestjs-common';

export interface PhotoEntityInterface extends ReferenceIdInterface {
  name: string;
  description: string;
  filename: string;
  views: number;
  isPublished: boolean;
  deletedAt: Date | null;
}
