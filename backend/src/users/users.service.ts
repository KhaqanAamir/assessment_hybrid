import { HttpStatus, Injectable } from '@nestjs/common';
import { CONNECTION_STATUS } from '@prisma/client';
import { PrismaService } from 'src/prisma_service/prisma.service';
import { CustomResponse } from 'types/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions(
    userId: string,
    { skip, take },
  ): Promise<CustomResponse> {
    try {
      const [sent, received, connected] = await Promise.all([
        this.prisma.connection_requests.findMany({
          where: { sender_id: userId },
          select: { receiver_id: true },
        }),
        this.prisma.connection_requests.findMany({
          where: { receiver_id: userId },
          select: { sender_id: true },
        }),
        this.prisma.connections.findMany({
          where: {
            OR: [{ user1_id: userId }, { user2_id: userId }],
          },
          select: { user1_id: true, user2_id: true },
        }),
      ]);

      const excludedIds = new Set<string>();
      sent.forEach((r) => excludedIds.add(r.receiver_id));
      received.forEach((r) => excludedIds.add(r.sender_id));
      connected.forEach((c) => {
        excludedIds.add(c.user1_id === userId ? c.user2_id : c.user1_id);
      });
      excludedIds.add(userId);

      const [data, total] = await this.prisma.$transaction([
        this.prisma.users.findMany({
          where: {
            id: { notIn: Array.from(excludedIds) },
          },
          skip,
          take,
        }),
        this.prisma.users.count({
          where: {
            id: { notIn: Array.from(excludedIds) },
          },
        }),
      ]);

      return {
        error: false,
        msg: 'Suggested users fetched successfully',
        status: HttpStatus.OK,
        data: data,
        skip,
        take,
        total,
      };
    } catch (e) {
      return { error: true, msg: `Inernal server error occured, ${e}` };
    }
  }

  async getAllUsers(userId: string, { skip, take }): Promise<CustomResponse> {
    try {
      const connections = await this.prisma.connections.findMany({
        where: {
          OR: [{ user1_id: userId }, { user2_id: userId }],
        },
        select: {
          user1_id: true,
          user2_id: true,
        },
      });

      // Step 2: Extract connected user IDs
      const connectedUserIds = connections.map((c) =>
        c.user1_id === userId ? c.user2_id : c.user1_id,
      );

      // Step 3: Fetch connected users
      const connectedUsers = await this.prisma.users.findMany({
        where: {
          id: {
            in: connectedUserIds,
          },
        },
        skip,
        take,
      });

      // Step 4: Fetch unconnected users (not self, not connected)
      const unconnectedUsers = await this.prisma.users.findMany({
        where: {
          id: {
            notIn: [userId, ...connectedUserIds],
          },
        },
        skip,
        take,
      });

      return {
        error: false,
        msg: 'Fetched users successfully',
        data: {
          connected: connectedUsers,
          unconnected: unconnectedUsers,
        },
      };
    } catch (e) {
      return {
        error: true,
        msg: `Internal server error occurred: ${e.message}`,
      };
    }
  }

  async getUserStats(userId: string) {
    try {
      // Single complex query to get all data at once
      const result: any = await this.prisma.$queryRaw`
      WITH user_connections AS (
        SELECT
          CASE
            WHEN user1_id = ${userId} THEN user2_id
            ELSE user1_id
          END as connected_user_id
        FROM connections
        WHERE user1_id = ${userId} OR user2_id = ${userId}
      ),
      other_user_connections AS (
        SELECT
          u.id as user_id,
          CASE
            WHEN c.user1_id = u.id THEN c.user2_id
            ELSE c.user1_id
          END as connected_user_id
        FROM users u
        JOIN connections c ON (c.user1_id = u.id OR c.user2_id = u.id)
        WHERE u.id != ${userId}
      ),
      mutual_counts AS (
        SELECT
          ouc.user_id,
          COUNT(DISTINCT ouc.connected_user_id) as mutual_count
        FROM other_user_connections ouc
        INNER JOIN user_connections uc ON ouc.connected_user_id = uc.connected_user_id
        GROUP BY ouc.user_id
      )
      SELECT
        u.id,
        u."firstName",
        u."lastName",
        u.email,
        u.avatar,
        u."createdAt",
        u."updatedAt",
        COALESCE(mc.mutual_count, 0) as mutualUsers,
        CASE
          WHEN uc.connected_user_id IS NOT NULL THEN 'CONNECTED'
          WHEN cr_sent.id IS NOT NULL THEN 'REQUEST_SENT'
          WHEN cr_received.id IS NOT NULL THEN 'REQUEST_RECEIVED'
          ELSE 'UNCONNECTED'
        END as relationship_status,
        cr_sent.id as sent_request_id,
        cr_sent."createdAt" as sent_request_date,
        cr_received.id as received_request_id,
        cr_received."createdAt" as received_request_date
      FROM users u
      LEFT JOIN user_connections uc ON u.id = uc.connected_user_id
      LEFT JOIN connection_requests cr_sent ON (
        cr_sent.sender_id = ${userId} AND
        cr_sent.receiver_id = u.id AND
        cr_sent.status = 'PENDING'
      )
      LEFT JOIN connection_requests cr_received ON (
        cr_received.receiver_id = ${userId} AND
        cr_received.sender_id = u.id AND
        cr_received.status = 'PENDING'
      )
      LEFT JOIN mutual_counts mc ON u.id = mc.user_id
      WHERE u.id != ${userId}
      ORDER BY u."firstName", u."lastName"
    `;

      // Process results without loops
      const sentRequests = result
        .filter((r) => r.relationship_status === 'REQUEST_SENT')
        .map((r) => ({
          id: r.sent_request_id,
          sender_id: userId,
          receiver_id: r.id,
          status: 'PENDING',
          createdAt: r.sent_request_date,
          receiver: {
            id: r.id,
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            avatar: r.avatar,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          },
          mutualUsers: r.mutualUsers,
        }));

      const receivedRequests = result
        .filter((r) => r.relationship_status === 'REQUEST_RECEIVED')
        .map((r) => ({
          id: r.received_request_id,
          sender_id: r.id,
          receiver_id: userId,
          status: 'PENDING',
          createdAt: r.received_request_date,
          sender: {
            id: r.id,
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            avatar: r.avatar,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          },
          mutualUsers: r.mutualUsers,
        }));

      const unconnectedUsers = result
        .filter((r) => r.relationship_status === 'UNCONNECTED')
        .map((r) => ({
          id: r.id,
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
          avatar: r.avatar,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          mutualUsers: r.mutualUsers,
        }));

      return {
        error: false,
        msg: 'User stats fetched Successfully',
        data: {
          sentRequests,
          receivedRequests,
          unconnectedUsers,
        },
        status: HttpStatus.OK,
      };
    } catch (e) {
      return {
        error: true,
        msg: `Internal server error occurred: ${e.message}`,
      };
    }
  }
}
