import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'auth') {
  private prisma: PrismaClient;

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });

    this.prisma = new PrismaClient();
  }

  async validate(payload: any) {
    const { id } = payload;
    const user = await this.prisma.users.findUnique({
      where: { id },
    });
    if (user) return user;

    return null;
  }
}
