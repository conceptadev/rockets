export interface PhotoEntityInterface {
  id: number;
  name: string;
  description: string;
  filename: string;
  views: number;
  isPublished: boolean;
  deletedAt: Date | null;
}
