import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User, RegisterDto, UpdateUserDto } from '@cmpc-test/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si el email ya existe dentro de la transacción
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // Crear el usuario dentro de la transacción
      const user = queryRunner.manager.create(User, registerDto);
      const savedUser = await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'name', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Si se está actualizando la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Si se está actualizando el email, verificar que no exista
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async toggleStatus(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }
}
