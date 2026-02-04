import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';

export enum SaleStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER'
}

export class UpdateSaleStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la venta',
    enum: SaleStatus,
    example: SaleStatus.COMPLETED,
  })
  @IsEnum(SaleStatus)
  status!: SaleStatus;

  @ApiProperty({
    description: 'Método de pago (requerido para completar venta)',
    enum: PaymentMethod,
    required: false,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'Referencia de pago (opcional)',
    example: 'REF-123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  paymentReference?: string;
}
