import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ConnexionDto {
  @ApiProperty({
    description: "L'adresse email de l'utilisateur",
    example: 'utilisateur@exemple.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Le mot de passe de l\'utilisateur',
    example: 'MotDePasse123!'
  })
  @IsString()
  password: string;
} 