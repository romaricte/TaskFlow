import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

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
  name?: string;
} 