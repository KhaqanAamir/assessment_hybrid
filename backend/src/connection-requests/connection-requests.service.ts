import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma_service/prisma.service';
import { CustomResponse } from 'types/types';
import { CreateConnectionRequestDto } from './dtos/create-connection-request.dto';
import { CONNECTION_STATUS } from '@prisma/client';

@Injectable()
export class ConnectionRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSentRequests(
    userId: string,
    { skip, take },
  ): Promise<CustomResponse> {
    try {
      const [requests, total] = await this.prisma.$transaction([
        this.prisma.connection_requests.findMany({
          where: { sender_id: userId, status: CONNECTION_STATUS.PENDING },
          orderBy: { createdAt: 'desc' },
          include: {
            receiver: true,
          },
          skip,
          take,
        }),
        this.prisma.connection_requests.count({
          where: { sender_id: userId },
        }),
      ]);

      return {
        error: false,
        msg: 'Sent Requests fetched Successfully',
        data: requests,
        status: HttpStatus.OK,
        skip,
        take,
        total,
      };
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }

  async getReceivedRequests(
    userId: string,
    { skip, take },
  ): Promise<CustomResponse> {
    try {
      const [requests, total] = await this.prisma.$transaction([
        this.prisma.connection_requests.findMany({
          where: { receiver_id: userId, status: CONNECTION_STATUS.PENDING },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: true,
          },
          skip,
          take,
        }),
        this.prisma.connection_requests.count({
          where: { sender_id: userId },
        }),
      ]);

      return {
        error: false,
        msg: 'Received Requests fetched Successfully',
        data: requests,
        status: HttpStatus.OK,
        skip,
        take,
        total,
      };
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }

  async createRequest(
    userId: string,
    body: CreateConnectionRequestDto,
  ): Promise<CustomResponse> {
    try {
      const checkRequestIntiatedAlready = await this.prisma.getData(
        'connection_requests',
        'findMany',
        {
          where: {
            receiver_id: { in: [userId, body.receiver_id] },
            sender_id: { in: [userId, body.receiver_id] },
          },
        },
      );

      if (
        checkRequestIntiatedAlready.data &&
        checkRequestIntiatedAlready.data.length > 0
      )
        return {
          error: false,
          msg: 'Request already in process',
          data: null,
          status: HttpStatus.OK,
        };
      const createRequestResponse = await this.prisma.postData(
        'connection_requests',
        'create',
        {
          ...body,
          sender_id: userId,
        },
      );

      return createRequestResponse;
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }

  async acceptRequest(
    userId: string,
    requestId: string,
  ): Promise<CustomResponse> {
    try {
      const checkRequestStatus = await this.prisma.getData(
        'connection_requests',
        'findUnique',
        {
          where: {
            id: requestId,
            status: { notIn: [CONNECTION_STATUS.PENDING] },
          },
        },
      );
      if (checkRequestStatus.data)
        return {
          error: false,
          msg: 'Request already processed',
          data: null,
          status: HttpStatus.OK,
        };

      const acceptRequestResponse = await this.prisma.$transaction(
        async (tx) => {
          const acceptRequestResponse = await tx.connection_requests.update({
            where: {
              id: requestId,
              receiver_id: userId,
            },
            data: {
              status: CONNECTION_STATUS.ACCEPTED,
            },
          });

          await tx.connections.create({
            data: {
              user1_id: acceptRequestResponse.sender_id,
              user2_id: acceptRequestResponse.receiver_id,
            },
          });

          return acceptRequestResponse;
        },
      );
      return {
        error: false,
        msg: 'Request Accepted Successfully',
        data: acceptRequestResponse,
        status: HttpStatus.OK,
      };
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }

  async withdrawRequest(
    userId: string,
    reqId: string,
  ): Promise<CustomResponse> {
    try {
      const checkRequestStatus = await this.prisma.getData(
        'connection_requests',
        'findUnique',
        {
          where: {
            id: reqId,
            status: { notIn: [CONNECTION_STATUS.PENDING] },
          },
        },
      );

      if (checkRequestStatus.data) {
        return {
          error: false,
          msg: 'Request already processed',
          data: null,
          status: HttpStatus.OK,
        };
      }

      const withDrawRequestResponse = await this.prisma.deleteData(
        'connection_requests',
        'delete',
        {
          where: {
            id: reqId,
            OR: [{ receiver_id: userId }, { sender_id: userId }],
          },
        },
      );

      return withDrawRequestResponse;
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }

  async getAllRequests(userId: string): Promise<CustomResponse> {
    try {
      const getAllRequestsResponse = await this.prisma.getData(
        'connection_requests',
        'findMany',
        {
          where: { receiver_id: userId },
        },
      );

      return getAllRequestsResponse;
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }
}
