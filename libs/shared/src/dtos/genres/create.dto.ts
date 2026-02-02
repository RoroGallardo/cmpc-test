import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGenreDto {
  @ApiProperty({
    description: 'Nombre del género',
    example: 'Ficción',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    description: 'Descripción del género',
    example: 'Obras de ficción literaria',
  })
  @IsOptional()
  @IsString()
  description?: string;
}