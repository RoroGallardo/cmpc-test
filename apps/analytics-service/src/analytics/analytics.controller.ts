import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@cmpc-test/shared';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener métricas del dashboard en tiempo real' })
  async getDashboard() {
    return this.analyticsService.getDashboardMetrics();
  }

  @Get('sales')
  @ApiOperation({ summary: 'Análisis detallado de ventas por período' })
  async getSalesAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Ajustar end date al final del día para incluir todas las ventas de ese día
    end.setHours(23, 59, 59, 999);
    
    return this.analyticsService.getSalesAnalytics(start, end);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Métricas de inventario' })
  async getInventoryMetrics() {
    return this.analyticsService.getInventoryMetrics();
  }
}
