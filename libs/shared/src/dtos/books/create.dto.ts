import { 
  IsString, 
  IsNumber, 
  IsBoolean, 
  IsUUID, 
  IsOptional, 
  IsPositive, 
  MaxLength,
  MinLength 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Título del libro',
    example: 'Cien años de soledad',
    minLength: 1,
    maxLength: 300,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title!: string;

  @ApiProperty({
    description: 'Precio del libro en USD',
    example: 29.99,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({
    description: 'Disponibilidad del libro',
    example: true,
  })
  @IsBoolean()
  available!: boolean;

  @ApiProperty({
    description: 'ID del autor',
    example: 'a1234567-89ab-cdef-0123-456789abcdef',
    format: 'uuid',
  })
  @IsUUID()
  authorId!: string;

  @ApiProperty({
    description: 'ID de la editorial',
    example: 'b1234567-89ab-cdef-0123-456789abcdef',
    format: 'uuid',
  })
  @IsUUID()
  publisherId!: string;

  @ApiProperty({
    description: 'ID del género',
    example: 'c1234567-89ab-cdef-0123-456789abcdef',
    format: 'uuid',
  })
  @IsUUID()
  genreId!: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen del libro',
    example: 'https://example.com/book-cover.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}