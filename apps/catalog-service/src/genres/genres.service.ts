import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre, CreateGenreDto, UpdateGenreDto } from '@cmpc-test/shared';
import { Parser } from 'json2csv';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(createGenreDto: CreateGenreDto): Promise<Genre> {
    const genre = this.genreRepository.create(createGenreDto);
    return this.genreRepository.save(genre);
  }

  async findAll(): Promise<Genre[]> {
    return this.genreRepository.find();
  }

  async findOne(id: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) {
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }
    return genre;
  }

  async update(id: string, updateGenreDto: UpdateGenreDto): Promise<Genre> {
    await this.findOne(id);
    await this.genreRepository.update(id, updateGenreDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const genre = await this.findOne(id);
    await this.genreRepository.softRemove(genre);
  }

  async exportToCSV(): Promise<string> {
    const genres = await this.genreRepository.find();

    const data = genres.map(genre => ({
      ID: genre.id,
      Nombre: genre.name,
      Descripción: genre.description || '',
      'Fecha Creación': genre.createdAt?.toISOString().split('T')[0] || '',
    }));

    const parser = new Parser();
    return parser.parse(data);
  }
}
