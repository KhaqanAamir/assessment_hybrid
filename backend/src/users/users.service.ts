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

  // async getUserStats(userId: string): Promise<CustomResponse> {
  //   try {
  //     const allUsers = await this.prisma.users.findMany({
  //       where: { id: { not: userId } },
  //     });

  //     let requestsSent = await this.prisma.connection_requests.findMany({
  //       where: { sender_id: userId, status: CONNECTION_STATUS.PENDING },
  //       include: { receiver: true },
  //     });

  //     let requestsReceived = await this.prisma.connection_requests.findMany({
  //       where: { receiver_id: userId, status: CONNECTION_STATUS.PENDING },
  //       include: { sender: true },
  //     });

  //     const connectedUsersQuery = await this.prisma.connections.findMany({
  //       where: {
  //         OR: [{ user1_id: userId }, { user2_id: userId }],
  //       },
  //     });

  //     const transformedConnectedCustomers = connectedUsersQuery.map(
  //       (connection) => {
  //         return connection.user1_id === userId
  //           ? connection.user2_id
  //           : connection.user1_id;
  //       },
  //     );

  //     const sentUserIds = new Set(requestsSent.map((r) => r.receiver_id));
  //     const receivedUserIds = new Set(requestsReceived.map((r) => r.sender_id));
  //     const connectedUserIds = new Set(transformedConnectedCustomers);

  //     // const sentUsers = allUsers.filter((user) => sentUserIds.has(user.id));
  //     // const receivedUsers = allUsers.filter((user) =>
  //     //   receivedUserIds.has(user.id),
  //     // );

  //     requestsSent = await Promise.all(
  //       requestsSent.map(async (request) => {
  //         const [currentUserConnections, otherUserConnections] =
  //           await Promise.all([
  //             this.getConnectedUserIds(userId),
  //             this.getConnectedUserIds(request.receiver.id),
  //           ]);

  //         const mutualIds = currentUserConnections.filter((id) =>
  //           otherUserConnections.includes(id),
  //         );

  //         const [mutualUsers, total] = await this.prisma.$transaction([
  //           this.prisma.users.findMany({
  //             where: { id: { in: mutualIds } },
  //           }),
  //           this.prisma.users.count({
  //             where: { id: { in: mutualIds } },
  //           }),
  //         ]);

  //         return {
  //           ...request,
  //           mutualUsers: total,
  //         };
  //       }),
  //     );

  //     requestsReceived = await Promise.all(
  //       requestsReceived.map(async (request) => {
  //         const [currentUserConnections, otherUserConnections] =
  //           await Promise.all([
  //             this.getConnectedUserIds(userId),
  //             this.getConnectedUserIds(request.sender.id),
  //           ]);

  //         const mutualIds = currentUserConnections.filter((id) =>
  //           otherUserConnections.includes(id),
  //         );

  //         const [mutualUsers, total] = await this.prisma.$transaction([
  //           this.prisma.users.findMany({
  //             where: { id: { in: mutualIds } },
  //           }),
  //           this.prisma.users.count({
  //             where: { id: { in: mutualIds } },
  //           }),
  //         ]);

  //         return {
  //           ...request,
  //           mutualUsers: total,
  //         };
  //       }),
  //     );

  //     let unconnectedUsers = allUsers.filter(
  //       (user) =>
  //         !sentUserIds.has(user.id) &&
  //         !receivedUserIds.has(user.id) &&
  //         !connectedUserIds.has(user.id),
  //     );

  //     unconnectedUsers = await Promise.all(
  //       unconnectedUsers.map(async (user) => {
  //         const [currentUserConnections, otherUserConnections] =
  //           await Promise.all([
  //             this.getConnectedUserIds(userId),
  //             this.getConnectedUserIds(user.id),
  //           ]);

  //         const mutualIds = currentUserConnections.filter((id) =>
  //           otherUserConnections.includes(id),
  //         );

  //         const [mutualUsers, total] = await this.prisma.$transaction([
  //           this.prisma.users.findMany({
  //             where: { id: { in: mutualIds } },
  //           }),
  //           this.prisma.users.count({
  //             where: { id: { in: mutualIds } },
  //           }),
  //         ]);

  //         return {
  //           ...user,
  //           mutualUsers: total,
  //         };
  //       }),
  //     );

  //     return {
  //       error: false,
  //       msg: 'User stats fetched Successfully',
  //       data: {
  //         sentRequests: requestsSent,
  //         receivedRequests: requestsReceived,
  //         unconnectedUsers: unconnectedUsers,
  //       },
  //       status: HttpStatus.OK,
  //     };
  //   } catch (e) {
  //     return {
  //       error: true,
  //       msg: `Internal server error occurred: ${e.message}`,
  //     };
  //   }
  // }

  private async getMutualUserCount(
    userId: string,
    otherUserId: string,
  ): Promise<number> {
    const [currentUserConnections, otherUserConnections] = await Promise.all([
      this.getConnectedUserIds(userId),
      this.getConnectedUserIds(otherUserId),
    ]);

    const mutualIds = currentUserConnections.filter((id) =>
      otherUserConnections.includes(id),
    );

    return mutualIds.length;
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

  async getUserStats2(userId: string): Promise<CustomResponse> {
    try {
      const allUsers = await this.prisma.users.findMany({
        where: { id: { not: userId } },
      });

      let requestsSent = await this.prisma.connection_requests.findMany({
        where: { sender_id: userId, status: CONNECTION_STATUS.PENDING },
        include: { receiver: true },
      });

      let requestsReceived = await this.prisma.connection_requests.findMany({
        where: { receiver_id: userId, status: CONNECTION_STATUS.PENDING },
        include: { sender: true },
      });

      const connectedUsersQuery = await this.prisma.connections.findMany({
        where: {
          OR: [{ user1_id: userId }, { user2_id: userId }],
        },
      });

      const transformedConnectedCustomers = connectedUsersQuery.map(
        (connection) => {
          return connection.user1_id === userId
            ? connection.user2_id
            : connection.user1_id;
        },
      );

      requestsSent = await Promise.all(
        requestsSent.map(async (request) => {
          const mutualCount = await this.getMutualUserCount(
            userId,
            request.receiver_id,
          );

          return {
            ...request,
            mutualUsers: mutualCount,
          };
        }),
      );

      requestsReceived = await Promise.all(
        requestsReceived.map(async (request) => {
          const mutualCount = await this.getMutualUserCount(
            userId,
            request.sender_id,
          );

          return {
            ...request,
            mutualUsers: mutualCount,
          };
        }),
      );

      let unconnectedUsers = allUsers.filter(
        (user) =>
          !requestsSent.some((item) => item.receiver.id === user.id) &&
          !requestsReceived.some((item) => item.sender.id === user.id) &&
          !transformedConnectedCustomers.some((item) => item === user.id),
      );

      unconnectedUsers = await Promise.all(
        unconnectedUsers.map(async (user) => {
          const mutualCount = await this.getMutualUserCount(userId, user.id);

          return {
            ...user,
            mutualUsers: mutualCount,
          };
        }),
      );

      return {
        error: false,
        msg: 'User stats fetched Successfully',
        data: {
          sentRequests: requestsSent,
          receivedRequests: requestsReceived,
          unconnectedUsers: unconnectedUsers,
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
