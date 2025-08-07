import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { UserGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from './dtos/pagination.dto';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionService: ConnectionsService) {}

  @Get('/')
  @UseGuards(UserGuard)
  async getConnections(@Req() req, @Query() query: PaginationDto) {
    const skip =
      query.page_no && query.page_size
        ? (+query.page_no - 1) * +query.page_size
        : 0;
    const take = query.page_size ? +query.page_size : 100;
    return await this.connectionService.getConnections(req.user.id, {
      skip,
      take,
    });
  }

  @Delete('/:id')
  @UseGuards(UserGuard)
  async removeConnection(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    return await this.connectionService.removeConnection(req.user.id, id);
  }

  @Get(':userId/common')
  @UseGuards(UserGuard)
  getCommonConnections(
    @Req() req,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: PaginationDto,
  ) {
    const skip =
      query.page_no && query.page_size
        ? (+query.page_no - 1) * +query.page_size
        : 0;
    const take = query.page_size ? +query.page_size : 100;
    return this.connectionService.getCommonConnections(req.user.id, userId, {
      skip,
      take,
    });
  }
}
