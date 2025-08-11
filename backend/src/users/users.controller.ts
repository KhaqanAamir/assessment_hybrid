import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserGuard } from 'src/auth/guards/auth.guard';
import { GetAllSuggestionsDto } from './dtos/get-all-suggestions.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userSerive: UsersService) {}

  /**
   * @deprecated This endpoint is no longer in used.
   * Will be removed shortly.
   * Please use getUserStats function instead of this
   */
  @Get('suggestions')
  @UseGuards(UserGuard)
  async getSuggestions(
    @Req() req,
    @Res() res,
    @Query() query: GetAllSuggestionsDto,
  ) {
    res.setHeader('Deprecation', 'true');
    res.setHeader(
      'Warning',
      '299 - "This API is deprecated and will be removed soon."',
    );
    console.warn('⚠️ /suggestions endpoint is deprecated.');
    const skip =
      query.page_no && query.page_size
        ? (+query.page_no - 1) * +query.page_size
        : 0;
    const take = query.page_size ? +query.page_size : 10;
    return await this.userSerive.getSuggestions(req.user.id, { skip, take });
  }

  /**
   * @deprecated This endpoint is no longer in used.
   * Will be removed shortly.
   * Please use getUserStats function instead of this
   */

  @Get('all')
  @UseGuards(UserGuard)
  async getAllUSers(
    @Req() req,
    @Res() res,
    @Query() query: GetAllSuggestionsDto,
  ) {
    res.setHeader('Deprecation', 'true');
    res.setHeader(
      'Warning',
      '299 - "This API is deprecated and will be removed soon."',
    );
    console.warn('⚠️ /suggestions endpoint is deprecated.');
    const skip =
      query.page_no && query.page_size
        ? (+query.page_no - 1) * +query.page_size
        : 0;
    const take = query.page_size ? +query.page_size : 10;
    return await this.userSerive.getAllUsers(req.user.id, { skip, take });
  }

  @Get('stats')
  @UseGuards(UserGuard)
  async getUserStats(@Req() req) {
    return await this.userSerive.getUserStats(req.user.id);
  }
}
