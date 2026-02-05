import { Controller, Post, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@cmpc-test/shared';
import { CatalogSeeder } from './seeds/catalog.seeder';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('database')
@Controller('database')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class DatabaseController {
  constructor(
    private readonly catalogSeeder: CatalogSeeder,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Post('seed/catalog')
  @ApiOperation({ summary: 'Ejecutar seed del catálogo completo (solo admin)' })
  async seedCatalog() {
    await this.catalogSeeder.seedCatalog();
    return { message: 'Seed del catálogo ejecutado exitosamente' };
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Limpiar toda la base de datos (solo admin)' })
  async clearDatabase() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Eliminar en orden inverso a las dependencias de foreign keys
      await queryRunner.manager.delete('Alert', {});
      await queryRunner.manager.delete('BookAnalytics', {});
      await queryRunner.manager.delete('SaleItem', {});
      await queryRunner.manager.delete('Sale', {});
      await queryRunner.manager.delete('StockMovement', {});
      await queryRunner.manager.delete('Inventory', {});
      await queryRunner.manager.delete('InventorySnapshot', {});
      await queryRunner.manager.delete('AuditLog', {});
      await queryRunner.manager.delete('Book', {});
      await queryRunner.manager.delete('Author', {});
      await queryRunner.manager.delete('Publisher', {});
      await queryRunner.manager.delete('Genre', {});

      await queryRunner.commitTransaction();
      return { message: 'Base de datos limpiada exitosamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  @Post('reset')
  @ApiOperation({ summary: 'Limpiar y ejecutar seed del catálogo (solo admin)' })
  async resetDatabase() {
    await this.clearDatabase();
    await this.catalogSeeder.seedCatalog();
    return { message: 'Base de datos reiniciada y seed ejecutado exitosamente' };
  }
}
