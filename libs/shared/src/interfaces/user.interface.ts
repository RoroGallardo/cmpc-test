export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}