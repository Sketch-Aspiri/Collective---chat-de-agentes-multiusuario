import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { prisma } from '../../config/database';
import { UnauthorizedError, ValidationError } from '../../utils/errors';
import { AuthCredentials } from './auth.model';

const SALT_ROUNDS = 12;

export class AuthService {
  async register({ email, password }: AuthCredentials & { name?: string }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ValidationError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: email.split('@')[0] },
    });

    return this.issueToken(user.id);
  }

  async login({ email, password }: AuthCredentials) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return this.issueToken(user.id);
  }

  private issueToken(userId: string) {
    const token = jwt.sign({ userId }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
    return { token };
  }
}

export const authService = new AuthService();
