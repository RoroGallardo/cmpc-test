import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards,
  Query,
  Res,
  StreamableFile,
  Header,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { CreateBookDto, UpdateBookDto, FilterBookDto, JwtAuthGuard } from '@cmpc-test/shared';
import { SWAGGER_EXAMPLES, SWAGGER_RESPONSE_EXAMPLES } from '@cmpc-test/utils';
import { BooksService } from './books.service';

@ApiTags('books')
@Controller('books')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post('search')
  @ApiOperation({ 
    summary: 'Buscar libros con filtros avanzados',
    description: 'Permite buscar libros por título, autor, género, editorial, disponibilidad y más. Incluye paginación y ordenamiento.'
  })
  @ApiBody({ 
    type: FilterBookDto,
    examples: {
      'Búsqueda simple': { value: SWAGGER_EXAMPLES.filterBook.simple },
      'Búsqueda completa': { value: SWAGGER_EXAMPLES.filterBook.complete },
      'Solo disponibles': { value: SWAGGER_EXAMPLES.filterBook.onlyAvailable },
      'Por género': { value: SWAGGER_EXAMPLES.filterBook.byGenre },
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de libros encontrados',
    schema: {
      example: SWAGGER_RESPONSE_EXAMPLES.books.searchSuccess
    }
  })
  search(@Body() filter: FilterBookDto) {
    return this.booksService.findAll(filter);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Crear un nuevo libro' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ 
    type: CreateBookDto,
    examples: {
      'Ejemplo': { value: SWAGGER_EXAMPLES.createBook.simple }
    }
  })
  @ApiResponse({ status: 201, description: 'Libro creado exitosamente' })
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.booksService.create(createBookDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los libros' })
  findAll(@Query() filter: FilterBookDto) {
    return this.booksService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un libro por ID' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Actualizar un libro' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ 
    type: UpdateBookDto,
    examples: {
      'Ejemplo': { value: SWAGGER_EXAMPLES.updateBook.simple }
    }
  })
  @ApiResponse({ status: 200, description: 'Libro actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  update(
    @Param('id') id: string, 
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.booksService.update(id, updateBookDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un libro (soft delete)' })
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Exportar libros a CSV' })
  @ApiResponse({ status: 200, description: 'Archivo CSV generado exitosamente' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="books.csv"')
  async exportCSV(@Query() filter: FilterBookDto, @Res({ passthrough: true }) res: Response) {
    const csv = await this.booksService.exportToCSV(filter);
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }
}
