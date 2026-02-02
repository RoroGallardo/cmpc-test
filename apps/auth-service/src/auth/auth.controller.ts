import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginDto, RegisterDto, JwtAuthGuard, Roles, RolesGuard, UserRole } from '@cmpc-test/shared';
import { SWAGGER_EXAMPLES, SWAGGER_RESPONSE_EXAMPLES } from '@cmpc-test/utils';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un nuevo usuario (solo admin)' })
  @ApiBody({ 
    type: RegisterDto,
    examples: {
      'Ejemplo': { value: SWAGGER_EXAMPLES.register.simple }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: SWAGGER_RESPONSE_EXAMPLES.auth.registerSuccess
    }
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ 
    type: LoginDto,
    examples: {
      'Usuario normal': { value: SWAGGER_EXAMPLES.login.simple },
      'Usuario admin': { value: SWAGGER_EXAMPLES.login.admin },
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    schema: {
      example: SWAGGER_RESPONSE_EXAMPLES.auth.loginSuccess
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      example: SWAGGER_RESPONSE_EXAMPLES.auth.profile
    }
  })
  getProfile(@Request() req: any) {
    return req.user;
  }
}
