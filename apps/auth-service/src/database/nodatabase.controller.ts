import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@cmpc-test/shared';
import { AdminSeeder } from './seeds/admin.seeder';

@ApiTags('database')
@Controller('database')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class DatabaseController {
  constructor(private readonly adminSeeder: AdminSeeder) {}

  @Post('seed/admin')
  @ApiOperation({ summary: 'Ejecutar seed de usuario admin (solo admin)' })
  async seedAdmin() {
    await this.adminSeeder.seedAdminUser();
    return { message: 'Seed de usuario admin ejecutado' };
  }
}
