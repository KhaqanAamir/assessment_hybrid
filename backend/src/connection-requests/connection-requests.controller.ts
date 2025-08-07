import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConnectionRequestsService } from './connection-requests.service';
import { UserGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from './dtos/pagination.dto';
import { CreateConnectionRequestDto } from './dtos/create-connection-request.dto';

@Controller('connection-requests')
export class ConnectionRequestsController {
  constructor(
    private readonly connectionRequestsService: ConnectionRequestsService,
  ) {}

  @Get('sent')
  @UseGuards(UserGuard)
  async getSentRequests(@Req() req, @Query() query: PaginationDto) {
    const skip =
      query.page_no && query.page_size
        ? (+query.page_no - 1) * +query.page_size
        : 0;
    const take = query.page_size ? +query.page_size : 100;
    return await this.connectionRequestsService.getSentRequests(req.user.id, {
      skip,
      take,
    });
  }

  @Get('received')
  @UseGuards(UserGuard)
  async getReceivedRequests(@Req() req, @Query() query: PaginationDto) {
    const skip =
      query.page_no && query.page_size
        ? (+query.page_no - 1) * +query.page_size
        : 0;
    const take = query.page_size ? +query.page_size : 100;
    return await this.connectionRequestsService.getReceivedRequests(
      req.user.id,
      {
        skip,
        take,
      },
    );
  }

  @Post('/')
  @UseGuards(UserGuard)
  async createRequest(@Req() req, @Body() body: CreateConnectionRequestDto) {
    if (body.receiver_id === req.user.id) {
      return {
        error: false,
        msg: 'Cannot send request to self',
        data: null,
        status: HttpStatus.OK,
      };
    }
    return await this.connectionRequestsService.createRequest(
      req.user.id,
      body,
    );
  }

  @Put(':id/accept')
  @UseGuards(UserGuard)
  async acceptRequest(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    return await this.connectionRequestsService.acceptRequest(req.user.id, id);
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  async withdrawRequest(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    return await this.connectionRequestsService.withdrawRequest(
      req.user.id,
      id,
    );
  }

  @Get('all')
  @UseGuards(UserGuard)
  async getAllRequests(@Req() req) {
    return await this.connectionRequestsService.getAllRequests(req.user.id);
  }
}
