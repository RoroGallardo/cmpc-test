export interface IPublisher {
  id: string;
  name: string;
  country?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}