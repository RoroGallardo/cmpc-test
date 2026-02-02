import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGenreDto {
  @ApiPropertyOptional({
    description: 'Nombre del género',
    example: 'Ficción',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción del género',
    example: 'Obras de ficción literaria',
  })
  @IsOptional()
  @IsString()
  description?: string;
}