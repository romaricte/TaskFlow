import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class InscriptionDto {
  @ApiProperty({
    description: "L'adresse email de l'utilisateur",
    example: 'utilisateur@exemple.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Le mot de passe de l\'utilisateur',
    example: 'MotDePasse123!',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: "Le nom de l'utilisateur",
    example: 'Jean Dupont'
  })
  @IsString()
  @IsOptional()
  name?: string;
  
  @ApiPropertyOptional({
    description: "Le rôle de l'utilisateur",
    enum: UserRole,
    default: UserRole.USER
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
} 