import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { UnauthorizedError } from '../../utils/errors';
import { chatsService } from './chats.service';

export class ChatsController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.userId) throw new UnauthorizedError();
    const chat = await chatsService.create(req.userId, req.body);
    res.status(201).json({ success: true, data: chat, error: null });
  }

  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.userId) throw new UnauthorizedError();
    const chats = await chatsService.listForUser(req.userId);
    res.status(200).json({ success: true, data: chats, error: null });
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const chat = await chatsService.getById(req.params.id);
    res.status(200).json({ success: true, data: chat, error: null });
  }

  async inviteMember(req: AuthenticatedRequest, res: Response): Promise<void> {
    const member = await chatsService.inviteMember(req.params.id, req.body);
    res.status(201).json({ success: true, data: member, error: null });
  }
}

export const chatsController = new ChatsController();
