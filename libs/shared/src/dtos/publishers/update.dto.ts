import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePublisherDto {
  @ApiPropertyOptional({
    description: 'Nombre de la editorial',
    example: 'Sudamericana',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    description: 'País de la editorial',
    example: 'Argentina',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Sitio web de la editorial',
    example: 'www.sudamericana.com',
  })
  @IsOptional()
  @IsString()
  website?: string;
}