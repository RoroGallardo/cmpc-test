import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsArray, ValidateNested, IsUUID, IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @ApiProperty({
    description: 'ID del libro',
    example: 'a1234567-89ab-cdef-0123-456789abcdef',
  })
  @IsUUID()
  bookId!: string;

  @ApiProperty({
    description: 'Cantidad de libros',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity!: number;

  @ApiProperty({
    description: 'Descuento aplicado al item (opcional)',
    example: 0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;
}

export class CreateSaleDto {
  @ApiProperty({
    description: 'Nombre del cliente (opcional)',
    example: 'Juan Pérez',
    required: false,
  })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({
    description: 'Email del cliente (opcional)',
    example: 'juan.perez@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({
    description: 'ID del cliente (opcional)',
    example: 'customer-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({
    description: 'Items de la venta',
    type: [CreateSaleItemDto],
    example: [
      { bookId: 'a1234567-89ab-cdef-0123-456789abcdef', quantity: 2, discount: 0 },
      { bookId: 'b1234567-89ab-cdef-0123-456789abcdef', quantity: 1, discount: 5 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];

  @ApiProperty({
    description: 'Descuento general de la venta (opcional)',
    example: 10,
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiProperty({
    description: 'Notas adicionales (opcional)',
    example: 'Cliente frecuente',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'ID del vendedor (opcional)',
    example: 'seller-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  sellerId?: string;

  @ApiProperty({
    description: 'Nombre del vendedor (opcional)',
    example: 'María González',
    required: false,
  })
  @IsString()
  @IsOptional()
  sellerName?: string;
}
