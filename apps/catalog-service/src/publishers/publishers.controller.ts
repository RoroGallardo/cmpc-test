import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards,
  Res,
  StreamableFile,
  Header
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreatePublisherDto, UpdatePublisherDto, JwtAuthGuard } from '@cmpc-test/shared';
import { SWAGGER_EXAMPLES } from '@cmpc-test/utils';
import { PublishersService } from './publishers.service';

@ApiTags('publishers')
@Controller('publishers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva editorial' })
  @ApiBody({ 
    type: CreatePublisherDto,
    examples: {
      'Ejemplo': { value: SWAGGER_EXAMPLES.createPublisher.simple }
    }
  })
  @ApiResponse({ status: 201, description: 'Editorial creada exitosamente' })
  create(@Body() createPublisherDto: CreatePublisherDto) {
    return this.publishersService.create(createPublisherDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las editoriales' })
  @ApiResponse({ status: 200, description: 'Lista de editoriales' })
  findAll() {
    return this.publishersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una editorial por ID' })
  @ApiResponse({ status: 200, description: 'Editorial encontrada' })
  @ApiResponse({ status: 404, description: 'Editorial no encontrada' })
  findOne(@Param('id') id: string) {
    return this.publishersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una editorial' })
  @ApiBody({ 
    type: UpdatePublisherDto,
    examples: {
      'Ejemplo': { value: SWAGGER_EXAMPLES.updatePublisher.simple }
    }
  })
  @ApiResponse({ status: 200, description: 'Editorial actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Editorial no encontrada' })
  update(@Param('id') id: string, @Body() updatePublisherDto: UpdatePublisherDto) {
    return this.publishersService.update(id, updatePublisherDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una editorial (soft delete)' })
  @ApiResponse({ status: 200, description: 'Editorial eliminada exitosamente' })
  remove(@Param('id') id: string) {
    return this.publishersService.remove(id);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Exportar editoriales a CSV' })
  @ApiResponse({ status: 200, description: 'Archivo CSV generado exitosamente' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="publishers.csv"')
  async exportCSV(@Res({ passthrough: true }) res: Response) {
    const csv = await this.publishersService.exportToCSV();
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }
}
