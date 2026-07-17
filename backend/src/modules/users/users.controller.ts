import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { usersService } from './users.service';
import { UnauthorizedError } from '../../utils/errors';

export class UsersController {
  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.userId) throw new UnauthorizedError();
    const user = await usersService.getById(req.userId);
    res.status(200).json({ success: true, data: user, error: null });
  }

  async updateMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.userId) throw new UnauthorizedError();
    const user = await usersService.update(req.userId, req.body);
    res.status(200).json({ success: true, data: user, error: null });
  }
}

export const usersController = new UsersController();
