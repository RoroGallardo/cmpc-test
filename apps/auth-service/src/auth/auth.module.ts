import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@cmpc-test/shared';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const privateKey = configService.get<string>('JWT_PRIVATE_KEY');
        if (!privateKey) {
          throw new Error('JWT_PRIVATE_KEY is not defined');
        }
        return {
          privateKey: privateKey.replace(/\\n/g, '\n'),
          publicKey: configService.get<string>('JWT_PUBLIC_KEY')?.replace(/\\n/g, '\n'),
          signOptions: {
            expiresIn: configService.get('JWT_EXPIRATION') || '1h',
            algorithm: 'RS256',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
