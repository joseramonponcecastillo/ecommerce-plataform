import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ApiError.conflict('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, parseInt(env.BCRYPT_ROUNDS));

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Crear carrito vacío para el usuario
    await prisma.cart.create({
      data: { userId: user.id },
    });

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return { user, token };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw ApiError.unauthorized('Credenciales inválidas');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw ApiError.unauthorized('Credenciales inválidas');
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    return user;
  },
};
