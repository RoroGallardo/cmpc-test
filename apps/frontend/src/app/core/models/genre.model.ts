export interface Genre {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface CreateGenreDto {
  name: string;
  description?: string;
}

export interface UpdateGenreDto {
  name?: string;
  description?: string;
}
