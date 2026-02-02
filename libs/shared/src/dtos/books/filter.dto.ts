// libs/shared/src/dtos/books/filter-book.dto.ts
import { 
  IsOptional, 
  IsString, 
  IsBoolean, 
  IsUUID, 
  IsInt, 
  Min,
  IsIn 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterBookDto {
  @ApiPropertyOptional({
    description: 'Búsqueda por título del libro',
    example: 'soledad',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de género',
    example: 'c1234567-89ab-cdef-0123-456789abcdef',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  genreId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de autor',
    example: 'a1234567-89ab-cdef-0123-456789abcdef',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de editorial',
    example: 'b1234567-89ab-cdef-0123-456789abcdef',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  publisherId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por disponibilidad',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  available?: boolean;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Orden de clasificación',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}