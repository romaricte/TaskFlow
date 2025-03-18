import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { InscriptionDto } from './dto/inscription.dto';
import { ConnexionDto } from './dto/connexion.dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiBody({ type: InscriptionDto })
  @ApiResponse({ 
    status: 201, 
    description: 'L\'utilisateur a été créé avec succès',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'JWT token d\'authentification'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async signUp(@Body() inscriptionDto: InscriptionDto) {
    return this.authService.signUp(
      inscriptionDto.email,
      inscriptionDto.password,
      inscriptionDto.name,
      inscriptionDto.role
    );
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion d\'un utilisateur existant' })
  @ApiBody({ type: ConnexionDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'JWT token d\'authentification'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async signIn(@Body() connexionDto: ConnexionDto) {
    return this.authService.signIn(
      connexionDto.email,
      connexionDto.password
    );
  }
}
