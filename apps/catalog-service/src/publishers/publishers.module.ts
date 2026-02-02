import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publisher } from '@cmpc-test/shared';
import { PublishersController } from './publishers.controller';
import { PublishersService } from './publishers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Publisher])],
  controllers: [PublishersController],
  providers: [PublishersService],
})
export class PublishersModule {}
