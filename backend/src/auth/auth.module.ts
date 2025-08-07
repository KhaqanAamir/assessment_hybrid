import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthStrategy } from './strategies/auth.strategy';
import { UserGuard } from './guards/auth.guard';

@Module({
  imports:[
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_SEC + 's' }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthStrategy, UserGuard],
  exports:[AuthStrategy, UserGuard]
})
export class AuthModule {}
