import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@cmpc-test/shared';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('abc-analysis')
  @ApiOperation({ summary: 'Análisis ABC de inventario (Pareto)' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getABCAnalysis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Ajustar end date al final del día para incluir todas las ventas de ese día
    end.setHours(23, 59, 59, 999);
    
    return this.reportsService.generateABCAnalysis(start, end);
  }

  @Get('profitability')
  @ApiOperation({ summary: 'Reporte de rentabilidad por categoría' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getProfitability(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Ajustar end date al final del día para incluir todas las ventas de ese día
    end.setHours(23, 59, 59, 999);
    
    return this.reportsService.generateProfitabilityReport(start, end);
  }

  @Get('seasonality')
  @ApiOperation({ summary: 'Análisis de estacionalidad de ventas' })
  async getSeasonality() {
    return this.reportsService.generateSeasonalityReport();
  }

  @Get('stock-rotation')
  @ApiOperation({ summary: 'Reporte de rotación de inventario' })
  async getStockRotation() {
    return this.reportsService.generateStockRotationReport();
  }

  @Get('audit-trail')
  @ApiOperation({ summary: 'Trazabilidad completa de cambios' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  async getAuditTrail(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('entityId') entityId?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Ajustar end date al final del día para incluir todas las ventas de ese día
    end.setHours(23, 59, 59, 999);
    
    return this.reportsService.generateAuditTrail(start, end, entityId);
  }
}
