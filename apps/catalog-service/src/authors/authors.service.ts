import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author, CreateAuthorDto, UpdateAuthorDto } from '@cmpc-test/shared';
import { Parser } from 'json2csv';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorRepository.create(createAuthorDto);
    return this.authorRepository.save(author);
  }

  async findAll(): Promise<Author[]> {
    return this.authorRepository.find();
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) {
      throw new NotFoundException(`Autor con ID ${id} no encontrado`);
    }
    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    await this.findOne(id);
    await this.authorRepository.update(id, updateAuthorDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const author = await this.findOne(id);
    await this.authorRepository.softRemove(author);
  }

  async exportToCSV(): Promise<string> {
    const authors = await this.authorRepository.find();

    const data = authors.map(author => ({
      ID: author.id,
      Nombre: author.name,
      Biografía: author.biography || '',
      'Año Nacimiento': author.birthYear || '',
      'Fecha Creación': author.createdAt?.toISOString().split('T')[0] || '',
    }));

    const parser = new Parser();
    return parser.parse(data);
  }
}
