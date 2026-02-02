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
import { CreateGenreDto, UpdateGenreDto, JwtAuthGuard } from '@cmpc-test/shared';
import { SWAGGER_EXAMPLES } from '@cmpc-test/utils';
import { GenresService } from './genres.service';

@ApiTags('genres')
@Controller('genres')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo género' })
  @ApiBody({ 
    type: CreateGenreDto,
    examples: {
      'Ejemplo': { value: SWAGGER_EXAMPLES.createGenre.simple }
    }
  })
  @ApiResponse({ status: 201, description: 'Género creado exitosamente' })
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los géneros' })
  @ApiResponse({ status: 200, description: 'Lista de géneros' })
  findAll() {
    return this.genresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un género por ID' })
  @ApiResponse({ status: 200, description: 'Género encontrado' })
  @ApiResponse({ status: 404, description: 'Género no encontrado' })
  findOne(@Param('id') id: string) {
    return this.genresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un género' })
  @ApiBody({ 
    type: UpdateGenreDto,
    examples: {
      'Ejemplo': { value: SWAGGER_EXAMPLES.updateGenre.simple }
    }
  })
  @ApiResponse({ status: 200, description: 'Género actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Género no encontrado' })
  update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genresService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un género (soft delete)' })
  @ApiResponse({ status: 200, description: 'Género eliminado exitosamente' })
  remove(@Param('id') id: string) {
    return this.genresService.remove(id);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Exportar géneros a CSV' })
  @ApiResponse({ status: 200, description: 'Archivo CSV generado exitosamente' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="genres.csv"')
  async exportCSV(@Res({ passthrough: true }) res: Response) {
    const csv = await this.genresService.exportToCSV();
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }
}
