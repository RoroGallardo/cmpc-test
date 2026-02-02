import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@cmpc-test/shared';
import { CatalogSeeder } from './seeds/catalog.seeder';

@ApiTags('database')
@Controller('database')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class DatabaseController {
  constructor(private readonly catalogSeeder: CatalogSeeder) {}

  @Post('seed/catalog')
  @ApiOperation({ summary: 'Ejecutar seed del catálogo completo (solo admin)' })
  async seedCatalog() {
    await this.catalogSeeder.seedCatalog();
    return { message: 'Seed del catálogo ejecutado exitosamente' };
  }
}
