import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserSignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';
import { AuthBaseDto } from './dto/auth-base.dto';
import { UserGuard } from './guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async signUp(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10_000_000 })],
      }),
    )
    file: Express.Multer.File,

    @Body() userSignUpDto: any,
  ) {
    return await this.authService.signUp(userSignUpDto, file);
  }

  @Post('/login')
  async signIn(@Body() userSignInDto: AuthBaseDto) {
    return await this.authService.signIn(userSignInDto);
  }

  @Get('me')
  @UseGuards(UserGuard)
  async getProfile(@Req() req) {
    return await this.authService.getProfile(req.user.id);
  }
}
