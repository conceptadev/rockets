import { ReferenceIdInterface } from '@concepta/ts-core';

export interface PhotoEntityInterfaceFixture extends ReferenceIdInterface {
  name: string;
  description: string;
  filename: string;
  views: number;
  isPublished: boolean;
  deletedAt: Date | null;
}
