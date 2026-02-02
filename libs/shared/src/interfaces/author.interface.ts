export interface IAuthor {
  id: string;
  name: string;
  biography?: string;
  birthYear?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}