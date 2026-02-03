import { Controller, Get, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, AlertType, AlertSeverity } from '@cmpc-test/shared';
import { AlertsService } from './alerts.service';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las alertas activas' })
  async getActiveAlerts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.alertsService.getActiveAlerts(limitNum);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Obtener alertas por tipo' })
  async getAlertsByType(@Param('type') type: AlertType) {
    return this.alertsService.getAlertsByType(type);
  }

  @Get('severity/:severity')
  @ApiOperation({ summary: 'Obtener alertas por severidad' })
  async getAlertsBySeverity(@Param('severity') severity: AlertSeverity) {
    return this.alertsService.getAlertsBySeverity(severity);
  }

  @Patch(':id/acknowledge')
  @ApiOperation({ summary: 'Marcar alerta como reconocida' })
  async acknowledgeAlert(@Param('id') id: string, @Request() req: any) {
    return this.alertsService.acknowledgeAlert(id, req.user.id || req.user.sub);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Marcar alerta como resuelta' })
  async resolveAlert(@Param('id') id: string) {
    return this.alertsService.resolveAlert(id);
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Descartar alerta' })
  async dismissAlert(@Param('id') id: string) {
    return this.alertsService.dismissAlert(id);
  }

  @Get('check')
  @ApiOperation({ summary: 'Ejecutar verificación manual de alertas' })
  async checkAlerts() {
    await this.alertsService.checkAndGenerateAlerts();
    return { message: 'Alert check completed' };
  }
}
