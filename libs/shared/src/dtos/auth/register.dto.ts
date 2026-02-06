import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../interfaces/user.interface';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'nuevo@example.com',
    type: String,
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'password123',
    minLength: 6,
    type: String,
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    maxLength: 200,
    type: String,
  })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    description: 'Rol del usuario (solo para admin)',
    enum: UserRole,
    example: UserRole.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Estado activo del usuario (solo para admin)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}