 

export interface Author   {
  id: string;
  name: string;
  biography?: string;
  birthYear?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface CreateAuthorDto {
  name: string;
  biography?: string;
  birthYear?: number;
}

export interface UpdateAuthorDto {
  name?: string;
  biography?: string;
  birthYear?: number;
}
