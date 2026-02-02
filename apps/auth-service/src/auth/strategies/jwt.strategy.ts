import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy as BaseJwtStrategy, JwtPayload } from '@cmpc-test/shared';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends BaseJwtStrategy {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super(configService);
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }
}
