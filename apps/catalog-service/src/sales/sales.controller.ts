import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, UserRole, CreateSaleDto, UpdateSaleStatusDto, FilterSaleDto } from '@cmpc-test/shared';
import { SalesService } from './sales.service';

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Crear una nueva venta' })
  @ApiBody({ 
    type: CreateSaleDto,
    examples: {
      'Venta simple': {
        value: {
          customerName: 'Juan Pérez',
          customerEmail: 'juan@example.com',
          items: [
            { bookId: 'uuid-book-1', quantity: 2, discount: 0 },
            { bookId: 'uuid-book-2', quantity: 1, discount: 5 },
          ],
          discount: 10,
          notes: 'Cliente frecuente',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Venta creada exitosamente',
    schema: {
      example: {
        id: 'uuid',
        customerName: 'Juan Pérez',
        status: 'PENDING',
        subtotal: 59.98,
        discount: 10,
        tax: 9.50,
        total: 59.48,
        items: [
          {
            bookId: 'uuid-book-1',
            bookTitle: 'Cien años de soledad',
            quantity: 2,
            unitPrice: 29.99,
            subtotal: 59.98,
          },
        ],
        createdAt: '2026-02-03T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o stock insuficiente' })
  async create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener todas las ventas con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ventas con paginación',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            customerName: 'Juan Pérez',
            status: 'COMPLETED',
            total: 59.48,
            createdAt: '2026-02-03T10:00:00Z',
          },
        ],
        meta: {
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      },
    },
  })
  async findAll(@Query() filterDto: FilterSaleDto) {
    return this.salesService.findAll(filterDto);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener resumen de ventas en un periodo' })
  @ApiResponse({
    status: 200,
    description: 'Resumen de ventas',
    schema: {
      example: {
        totalSales: 150,
        totalRevenue: 8950.50,
        totalItems: 350,
        averageOrderValue: 59.67,
      },
    },
  })
  async getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.salesService.getSummary(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ApiResponse({
    status: 200,
    description: 'Venta encontrada',
  })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar el estado de una venta' })
  @ApiBody({
    type: UpdateSaleStatusDto,
    examples: {
      'Completar venta': {
        value: {
          status: 'COMPLETED',
          paymentMethod: 'CREDIT_CARD',
          paymentReference: 'REF-123456',
        },
      },
      'Cancelar venta': {
        value: {
          status: 'CANCELLED',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Estado inválido o datos faltantes' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateSaleStatusDto,
  ) {
    return this.salesService.updateStatus(id, updateStatusDto);
  }
}
