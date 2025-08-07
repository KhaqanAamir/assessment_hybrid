import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserGuard } from 'src/auth/guards/auth.guard';
import { GetAllSuggestionsDto } from './dtos/get-all-suggestions.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userSerive: UsersService) {}

  // @Get('suggestions')
  // @UseGuards(UserGuard)
  // async getSuggestions(@Req() req, @Query() query: GetAllSuggestionsDto) {
  //   const skip =
  //     query.page_no && query.page_size
  //       ? (+query.page_no - 1) * +query.page_size
  //       : 0;
  //   const take = query.page_size ? +query.page_size : 10;
  //   return await this.userSerive.getSuggestions(req.user.id, { skip, take });
  // }
  // @Get('all')
  // @UseGuards(UserGuard)
  // async getAllUSers(@Req() req, @Query() query: GetAllSuggestionsDto) {
  //   const skip =
  //     query.page_no && query.page_size
  //       ? (+query.page_no - 1) * +query.page_size
  //       : 0;
  //   const take = query.page_size ? +query.page_size : 10;
  //   return await this.userSerive.getAllUsers(req.user.id, { skip, take });
  // }

  @Get('stats')
  @UseGuards(UserGuard)
  async getUserStats(@Req() req) {
    return await this.userSerive.getUserStats2(req.user.id);
  }
}
