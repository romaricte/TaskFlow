import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signUp(email: string, password: string, name?: string, role: UserRole = UserRole.USER) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    const payload: JwtPayload = { 
      userId: user.id,
      email: user.email,
      role: user.role
    };
    
    const token = this.jwtService.sign(payload);
    return { token };
  }

  async signIn(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload: JwtPayload = { 
      userId: user.id,
      email: user.email,
      role: user.role
    };
    
    const token = this.jwtService.sign(payload);
    return { token };
  }

  async validateUser(userId: number) {
    return this.prisma.user.findUnique({ 
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
  
  async demanderMotDePasseOublie(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Aucun utilisateur trouvé avec cet email');
    }

    // Générer un code OTP à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Supprimer les anciens OTP pour cet utilisateur
    await this.prisma.otpReset.deleteMany({ 
      where: { userId: user.id } 
    });
    
    // Définir une heure d'expiration (15 minutes)
    const expire = new Date();
    expire.setMinutes(expire.getMinutes() + 15);
    
    // Sauvegarder le code OTP dans la base de données
    const otpReset = await this.prisma.otpReset.create({
      data: {
        code,
        userId: user.id,
        expire,
      }
    });
    
    try {
      // Envoyer l'email avec le code OTP
      await this.mailService.envoyerCodeOTP(
        user.email,
        code,
        user.name ?? undefined
      );
      
      return { 
        message: 'Un code de réinitialisation a été envoyé à votre adresse email',
        expire: expire.toISOString() 
      };
    } catch (error) {
      // En cas d'erreur d'envoi d'email, supprimer le code OTP créé
      await this.prisma.otpReset.delete({
        where: { id: otpReset.id }
      });
      
      throw new BadRequestException('Impossible d\'envoyer l\'email de réinitialisation. Veuillez réessayer plus tard.');
    }
  }
  
  async resetMotDePasse(email: string, code: string, nouveauMotDePasse: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    
    // Rechercher le dernier code OTP valide pour cet utilisateur
    const otpReset = await this.prisma.otpReset.findFirst({
      where: {
        userId: user.id,
        code,
        expire: { gt: new Date() },
        utilisé: false
      }
    });
    
    if (!otpReset) {
      throw new BadRequestException('Code invalide ou expiré');
    }
    
    // Marquer le code comme utilisé
    await this.prisma.otpReset.update({
      where: { id: otpReset.id },
      data: { utilisé: true }
    });
    
    // Mettre à jour le mot de passe de l'utilisateur
    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
