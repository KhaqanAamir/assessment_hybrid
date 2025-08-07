import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma_service/prisma.service';
import { UserSignUpDto } from './dto/sign-up.dto';
import { CustomResponse } from 'types/types';
import { JwtService } from '@nestjs/jwt';
import { comparePassword, hashPassword } from 'utility/functions/bcrypt';
import { AuthBaseDto } from './dto/auth-base.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(body: any, file: Express.Multer.File): Promise<CustomResponse> {
    try {
      const existingUser = await this.prisma.getData('users', 'findUnique', {
        where: { email: body.email },
      });
      if (existingUser.data) {
        return {
          error: true,
          msg: 'User already exists',
          data: null,
          status: HttpStatus.BAD_REQUEST,
        };
      }

      body.password = await hashPassword(body.password);
      const signedUpResponse = await this.prisma.postData('users', 'create', {
        ...body,
        avatar: file.filename,
      });

      if (signedUpResponse.error || signedUpResponse.data == null)
        return signedUpResponse;

      const { password: _, ...payload } = signedUpResponse.data;

      const result = {
        accessToken: this.jwtService.sign(payload),
        expiresAt: new Date(
          Date.now() +
            1000 * parseInt(process.env.JWT_EXPIRATION_SEC || '36000'),
        ).getTime(),
        email: signedUpResponse.data.email,
        id: signedUpResponse.data.id,
      };
      signedUpResponse.data = result;
      return signedUpResponse;
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }

  async signIn({ email, password }: AuthBaseDto): Promise<CustomResponse> {
    try {
      const signedInResponse = await this.prisma.getData(
        'users',
        'findUnique',
        { where: { email: email }, select: { id: true, password: true } },
      );
      if (
        !signedInResponse.error &&
        signedInResponse.data != null &&
        (await comparePassword(password, signedInResponse.data.password))
      ) {
        const { password: _, ...payload } = signedInResponse.data;
        const result = {
          accessToken: this.jwtService.sign(payload),
          expiresAt: new Date(
            Date.now() +
              1000 * parseInt(process.env.JWT_EXPIRATION_SEC || '36000'),
          ).getTime(),
          email: signedInResponse.data.email,
          id: signedInResponse.data.id,
        };
        signedInResponse.data = result;
        return signedInResponse;
      }
      console.log(signedInResponse);
      signedInResponse.error = false;
      signedInResponse.msg = 'Invalid email or password';
      signedInResponse.data = null;
      signedInResponse.status = HttpStatus.UNAUTHORIZED;
      return signedInResponse;
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }

  async getProfile(userId: string): Promise<CustomResponse> {
    try {
      const getUserResponse = await this.prisma.getData('users', 'findUnique', {
        where: { id: userId },
      });

      return getUserResponse;
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }
}
