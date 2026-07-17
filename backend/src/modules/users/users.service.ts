import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { UpdateUserInput } from './users.model';

export class UsersService {
  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  async update(id: string, input: UpdateUserInput) {
    return prisma.user.update({ where: { id }, data: input });
  }
}

export const usersService = new UsersService();
