import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@cmpc-test/shared';
import { PredictiveService } from './predictive.service';

@ApiTags('Predictive Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('predictive')
export class PredictiveController {
  constructor(private readonly predictiveService: PredictiveService) {}

  @Get('demand/:bookId')
  @ApiOperation({ summary: 'Predicción de demanda para un libro específico' })
  async predictDemand(@Param('bookId') bookId: string) {
    return this.predictiveService.predictDemandForBook(bookId);
  }

  @Get('demand')
  @ApiOperation({ summary: 'Predicción de demanda para todos los libros' })
  async predictAllDemand() {
    return this.predictiveService.predictDemandForAllBooks();
  }

  @Get('restock-recommendations')
  @ApiOperation({ summary: 'Recomendaciones de reabastecimiento' })
  async getRestockRecommendations() {
    return this.predictiveService.getRestockRecommendations();
  }
}
