import { FastifyReply, FastifyRequest } from "fastify";
import { UserNotificationService } from "../services/UserNotificationService";

export class UserNotificationController {
  constructor(private userNotificationService: UserNotificationService) {}

  async getUserNotifications(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid: userId } = request.params;
      const notifications =
        await this.userNotificationService.getUserNotifications(userId);
      reply.status(200).send({
        success: true,
        message: "Notificações do usuário encontradas",
        data: notifications,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async getUnreadNotifications(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid: userId } = request.params;
      const notifications =
        await this.userNotificationService.getUnreadNotifications(userId);
      reply.status(200).send({
        success: true,
        message: "Notificações não lidas encontradas",
        data: notifications,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async markAsRead(
    request: FastifyRequest<{
      Params: { uuid: string; notificationId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { notificationId } = request.params;
      await this.userNotificationService.markAsRead(notificationId);
      reply.status(200).send({
        success: true,
        message: "Notificação marcada como lida",
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async markAllAsRead(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid: userId } = request.params;
      const unreadNotifications =
        await this.userNotificationService.getUnreadNotifications(userId);
      const markPromises = unreadNotifications.map((notification) =>
        this.userNotificationService.markAsRead(notification.uuid)
      );
      await Promise.all(markPromises);
      reply.status(200).send({
        success: true,
        message: "Todas as notificações foram marcadas como lidas",
        data: {
          markedCount: unreadNotifications.length,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async deleteNotification(
    request: FastifyRequest<{
      Params: { uuid: string; notificationId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { notificationId } = request.params;
      await this.userNotificationService.deleteNotification(notificationId);
      reply.status(200).send({
        success: true,
        message: "Notificação removida",
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async deleteAllNotifications(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid: userId } = request.params;
      await this.userNotificationService.deleteUserNotifications(userId);
      reply.status(200).send({
        success: true,
        message: "Todas as notificações foram removidas",
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
}
