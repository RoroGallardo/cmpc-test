import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { SaleStatus } from './update-sale-status.dto';

export class FilterSaleDto {
  @ApiProperty({
    description: 'Estado de la venta',
    enum: SaleStatus,
    required: false,
  })
  @IsEnum(SaleStatus)
  @IsOptional()
  status?: SaleStatus;

  @ApiProperty({
    description: 'ID del cliente',
    example: 'customer-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({
    description: 'Fecha de inicio (formato ISO)',
    example: '2026-01-01T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin (formato ISO)',
    example: '2026-02-03T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Número de página',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Registros por página',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  limit?: number = 10;
}
