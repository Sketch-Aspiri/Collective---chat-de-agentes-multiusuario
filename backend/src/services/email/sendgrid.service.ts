import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export class SendgridService {
  async send(to: string, subject: string, body: string): Promise<void> {
    if (!env.sendgridApiKey) {
      logger.warn('SENDGRID_API_KEY not set; skipping email send', { to, subject });
      return;
    }
    throw new Error('SendgridService.send not implemented');
  }
}

export const sendgridService = new SendgridService();
