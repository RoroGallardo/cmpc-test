import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User, UserRole } from '@cmpc-test/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminSeeder implements OnModuleInit {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    const nodeEnv = this.configService.get('NODE_ENV');
    // Solo ejecutar automáticamente en desarrollo
    if (nodeEnv === 'development') {
      await this.seedAdminUser();
    }
  }

  async seedAdminUser(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si ya existe un usuario admin dentro de la transacción
      const adminExists = await queryRunner.manager.findOne(User, {
        where: { role: UserRole.ADMIN },
      });

      if (adminExists) {
        this.logger.log('Usuario admin ya existe, saltando seed');
        await queryRunner.release();
        return;
      }

      // Obtener credenciales del admin desde variables de entorno
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
      const adminName = this.configService.get<string>('ADMIN_NAME') || 'Administrador';

      if (!adminEmail || !adminPassword) {
        this.logger.warn(
          'ADMIN_EMAIL o ADMIN_PASSWORD no están configurados. Saltando creación de admin inicial.',
        );
        await queryRunner.release();
        return;
      }

      // Crear el usuario admin dentro de la transacción
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = queryRunner.manager.create(User, {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: UserRole.ADMIN,
      });

      await queryRunner.manager.save(admin);
      await queryRunner.commitTransaction();
      
      this.logger.log(`Usuario admin creado exitosamente: ${adminEmail}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error al crear usuario admin inicial (rollback realizado):', error);
      // No lanzamos el error para no detener la aplicación
    } finally {
      await queryRunner.release();
    }
  }
}
