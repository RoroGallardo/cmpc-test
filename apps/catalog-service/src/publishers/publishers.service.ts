import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publisher, CreatePublisherDto, UpdatePublisherDto } from '@cmpc-test/shared';
import { Parser } from 'json2csv';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
  ) {}

  async create(createPublisherDto: CreatePublisherDto): Promise<Publisher> {
    const publisher = this.publisherRepository.create(createPublisherDto);
    return this.publisherRepository.save(publisher);
  }

  async findAll(): Promise<Publisher[]> {
    return this.publisherRepository.find();
  }

  async findOne(id: string): Promise<Publisher> {
    const publisher = await this.publisherRepository.findOne({ where: { id } });
    if (!publisher) {
      throw new NotFoundException(`Editorial con ID ${id} no encontrado`);
    }
    return publisher;
  }

  async update(id: string, updatePublisherDto: UpdatePublisherDto): Promise<Publisher> {
    await this.findOne(id);
    await this.publisherRepository.update(id, updatePublisherDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const publisher = await this.findOne(id);
    await this.publisherRepository.softRemove(publisher);
  }

  async exportToCSV(): Promise<string> {
    const publishers = await this.publisherRepository.find();

    const data = publishers.map(publisher => ({
      ID: publisher.id,
      Nombre: publisher.name,
      País: publisher.country || '',
      Website: publisher.website || '',
      'Fecha Creación': publisher.createdAt?.toISOString().split('T')[0] || '',
    }));

    const parser = new Parser();
    return parser.parse(data);
  }
}
