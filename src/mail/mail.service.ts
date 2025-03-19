import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private testAccount: any;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';

    if (isDev) {
      // Créer un compte de test avec Ethereal pour le développement
      this.testAccount = await nodemailer.createTestAccount();
      this.logger.log('Compte de test Ethereal créé pour les emails');
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: this.testAccount.user,
          pass: this.testAccount.pass,
        },
      });
    } else {
      // Utiliser la configuration SMTP réelle en production
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('MAIL_HOST'),
        port: this.configService.get<number>('MAIL_PORT'),
        secure: this.configService.get<boolean>('MAIL_SECURE'),
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASSWORD'),
        },
      });
    }
  }

  async envoyerCodeOTP(destinataire: string, code: string, nom?: string): Promise<void> {
    const from = `"TaskFlow" <${this.configService.get<string>('MAIL_FROM') || 'noreply@taskflow.com'}>`;

    const mailOptions = {
      from,
      to: destinataire,
      subject: 'Code de réinitialisation de mot de passe - TaskFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
          <p>Bonjour ${nom || ''},</p>
          <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte TaskFlow.</p>
          <p>Voici votre code de réinitialisation :</p>
          <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>Ce code expirera dans 15 minutes.</p>
          <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe TaskFlow</p>
        </div>
      `,
    };
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      // Si c'est un compte de test Ethereal, afficher l'URL de prévisualisation
      if (this.testAccount) {
        this.logger.log(`URL de prévisualisation du message: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`);
      throw error;
    }
  }
} 