import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'Nombre del autor',
    example: 'Gabriel García Márquez',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    description: 'Biografía del autor',
    example: 'Escritor colombiano, premio Nobel de Literatura',
  })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiPropertyOptional({
    description: 'Año de nacimiento del autor',
    example: 1927,
    minimum: 1000,
    maximum: new Date().getFullYear(),
  })
  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear())
  birthYear?: number;
}