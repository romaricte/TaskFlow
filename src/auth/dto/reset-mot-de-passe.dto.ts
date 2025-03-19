import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetMotDePasseDto {
  @ApiProperty({
    description: "L'adresse email de l'utilisateur",
    example: 'utilisateur@exemple.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Le code OTP envoyé par email',
    example: '123456'
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Le nouveau mot de passe',
    example: 'NouveauMotDePasse123!',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  nouveauMotDePasse: string;
} 