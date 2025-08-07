import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma_service/prisma.service';
import { CustomResponse } from 'types/types';

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getConnections(
    userId: string,
    { skip, take },
  ): Promise<CustomResponse> {
    try {
      const [allConnections, total] = await this.prisma.$transaction([
        this.prisma.connections.findMany({
          where: {
            OR: [{ user1_id: userId }, { user2_id: userId }],
          },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            user1: true,
            user2: true,
          },
        }),
        this.prisma.connections.count({
          where: {
            OR: [{ user1_id: userId }, { user2_id: userId }],
          },
        }),
      ]);

      const transformedConnections = allConnections.map((connection) => {
        const otherUser =
          connection.user1_id === userId ? connection.user2 : connection.user1;

        return {
          id: connection.id,
          createdAt: connection.createdAt,
          user: otherUser, // This will be the other person
        };
      });

      return {
        error: false,
        msg: 'Conections Fetched Successfully',
        data: transformedConnections,
        skip,
        take,
        total,
      };
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }

  async removeConnection(
    userId: string,
    reqId: string,
  ): Promise<CustomResponse> {
    try {
      const removeConnectionResponse = await this.prisma.deleteData(
        'connections',
        'delete',
        {
          where: { id: reqId },
        },
      );

      return removeConnectionResponse;
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }

  async getCommonConnections(
    currentUserId: string,
    otherUserId: string,
    { skip, take },
  ): Promise<CustomResponse> {
    try {
      const [currentUserConnections, otherUserConnections] = await Promise.all([
        this.getConnectedUserIds(currentUserId),
        this.getConnectedUserIds(otherUserId),
      ]);

      const mutualIds = currentUserConnections.filter((id) =>
        otherUserConnections.includes(id),
      );

      const [mutualUsers, total] = await this.prisma.$transaction([
        this.prisma.users.findMany({
          where: { id: { in: mutualIds } },
          skip,
          take,
        }),
        this.prisma.users.count({
          where: { id: { in: mutualIds } },
        }),
      ]);

      return {
        error: false,
        msg: 'Common Connections Fetched Successfully',
        data: mutualUsers,
        skip,
        take,
        total,
      };
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }
  private async getConnectedUserIds(userId: string): Promise<string[]> {
    const connections = await this.prisma.connections.findMany({
      where: {
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
      select: {
        user1_id: true,
        user2_id: true,
      },
    });

    return connections.map((c) =>
      c.user1_id === userId ? c.user2_id : c.user1_id,
    );
  }
}
