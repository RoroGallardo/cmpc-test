export interface Publisher {
  id: string;
  name: string;
  country?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface CreatePublisherDto {
  name: string;
  country?: string;
  website?: string;
}

export interface UpdatePublisherDto {
  name?: string;
  country?: string;
  website?: string;
}
