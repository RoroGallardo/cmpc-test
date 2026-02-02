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
import { CreateAuthorDto, UpdateAuthorDto, JwtAuthGuard } from '@cmpc-test/shared';
import { SWAGGER_EXAMPLES } from '@cmpc-test/utils';
import { AuthorsService } from './authors.service';

@ApiTags('authors')
@Controller('authors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo autor' })
  @ApiBody({ 
    type: CreateAuthorDto,
    examples: {
      'Ejemplo': { value: SWAGGER_EXAMPLES.createAuthor.simple }
    }
  })
  @ApiResponse({ status: 201, description: 'Autor creado exitosamente' })
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los autores' })
  @ApiResponse({ status: 200, description: 'Lista de autores' })
  findAll() {
    return this.authorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un autor por ID' })
  @ApiResponse({ status: 200, description: 'Autor encontrado' })
  @ApiResponse({ status: 404, description: 'Autor no encontrado' })
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un autor' })
  @ApiBody({ 
    type: UpdateAuthorDto,
    examples: {
      'Ejemplo': { value: SWAGGER_EXAMPLES.updateAuthor.simple }
    }
  })
  @ApiResponse({ status: 200, description: 'Autor actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Autor no encontrado' })
  update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un autor (soft delete)' })
  @ApiResponse({ status: 200, description: 'Autor eliminado exitosamente' })
  remove(@Param('id') id: string) {
    return this.authorsService.remove(id);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Exportar autores a CSV' })
  @ApiResponse({ status: 200, description: 'Archivo CSV generado exitosamente' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="authors.csv"')
  async exportCSV(@Res({ passthrough: true }) res: Response) {
    const csv = await this.authorsService.exportToCSV();
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }
}
