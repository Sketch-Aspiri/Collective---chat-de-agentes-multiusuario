import { Request, Response } from 'express';
import { paginationSchema } from '../../utils/validators';
import { messagesService } from './messages.service';

export class MessagesController {
  async create(req: Request, res: Response): Promise<void> {
    const message = await messagesService.create(req.body);
    res.status(201).json({ success: true, data: message, error: null });
  }

  async listForChat(req: Request, res: Response): Promise<void> {
    const { page, limit } = paginationSchema.parse(req.query);
    const messages = await messagesService.listForChat(req.params.chatId, page, limit);
    res.status(200).json({ success: true, data: messages, error: null, meta: { page, limit, total: messages.length } });
  }
}

export const messagesController = new MessagesController();
