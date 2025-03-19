import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class MotDePasseOublieDto {
  @ApiProperty({
    description: "L'adresse email de l'utilisateur",
    example: 'utilisateur@exemple.com'
  })
  @IsEmail()
  email: string;
} 