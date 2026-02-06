import { 
  IsString, 
  IsNumber, 
  IsBoolean, 
  IsUUID, 
  IsOptional, 
  IsPositive, 
  MaxLength,
  MinLength,
  IsDateString
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookDto {
  @ApiPropertyOptional({
    description: 'Título del libro',
    example: 'Cien años de soledad',
    minLength: 1,
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({
    description: 'Fecha de publicación del libro',
    example: '2020-01-15',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  publicationDate?: string;

  @ApiPropertyOptional({
    description: 'Precio del libro en USD',
    example: 29.99,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({
    description: 'Disponibilidad del libro',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiPropertyOptional({
    description: 'ID del autor',
    example: 'a1234567-89ab-cdef-0123-456789abcdef',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({
    description: 'ID de la editorial',
    example: 'b1234567-89ab-cdef-0123-456789abcdef',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  publisherId?: string;

  @ApiPropertyOptional({
    description: 'ID del género',
    example: 'c1234567-89ab-cdef-0123-456789abcdef',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  genreId?: string;

  @ApiPropertyOptional({
    description: 'Stock del libro',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional({
    description: 'URL de la imagen del libro',
    example: 'https://example.com/book-cover.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}