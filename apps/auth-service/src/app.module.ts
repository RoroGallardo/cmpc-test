import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, DatabaseModule } from '@cmpc-test/shared';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminSeeder } from './database/seeds/admin.seeder';
//import { DatabaseController } from './database/database.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule.forRoot({
      entities: [User],
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UsersModule,
  ],
  controllers: [
    // DatabaseController
  ],
  providers: [AdminSeeder],
})
export class AppModule {}
