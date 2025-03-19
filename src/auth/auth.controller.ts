import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { InscriptionDto } from './dto/inscription.dto';
import { ConnexionDto } from './dto/connexion.dto';
import { MotDePasseOublieDto } from './dto/mot-de-passe-oublie.dto';
import { ResetMotDePasseDto } from './dto/reset-mot-de-passe.dto';

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

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demande de réinitialisation de mot de passe' })
  @ApiBody({ type: MotDePasseOublieDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Email de réinitialisation envoyé',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Message de confirmation'
        },
        expire: {
          type: 'string',
          description: 'Date d\'expiration du code OTP'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Email non trouvé' })
  async forgotPassword(@Body() motDePasseOublieDto: MotDePasseOublieDto) {
    return this.authService.demanderMotDePasseOublie(motDePasseOublieDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réinitialisation du mot de passe avec code OTP' })
  @ApiBody({ type: ResetMotDePasseDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Mot de passe réinitialisé avec succès',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Message de confirmation'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Code invalide ou expiré' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async resetPassword(@Body() resetMotDePasseDto: ResetMotDePasseDto) {
    return this.authService.resetMotDePasse(
      resetMotDePasseDto.email,
      resetMotDePasseDto.code,
      resetMotDePasseDto.nouveauMotDePasse
    );
  }
}
