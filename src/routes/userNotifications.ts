import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { UserNotificationController } from "../controllers/UserNotificationController";

export const userNotificationsRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const userNotificationController = new UserNotificationController(
    fastify.userNotificationService
  );

  // Buscar todas as notificações do usuário
  fastify.get<{ Params: { uuid: string } }>(
    "/users/:uuid/notifications",
    {
      preHandler: [fastify.authenticate, fastify.authorize("self")],
    },
    userNotificationController.getUserNotifications.bind(
      userNotificationController
    )
  );

  // Buscar notificações não lidas do usuário
  fastify.get<{ Params: { uuid: string } }>(
    "/users/:uuid/notifications/unread",
    {
      preHandler: [fastify.authenticate, fastify.authorize("self")],
    },
    userNotificationController.getUnreadNotifications.bind(
      userNotificationController
    )
  );

  // Marcar notificação como lida
  fastify.patch<{ Params: { uuid: string; notificationId: string } }>(
    "/users/:uuid/notifications/:notificationId/read",
    {
      preHandler: [fastify.authenticate, fastify.authorize("self")],
    },
    userNotificationController.markAsRead.bind(userNotificationController)
  );

  // Marcar todas as notificações como lidas
  fastify.patch<{ Params: { uuid: string } }>(
    "/users/:uuid/notifications/read-all",
    {
      preHandler: [fastify.authenticate, fastify.authorize("self")],
    },
    userNotificationController.markAllAsRead.bind(userNotificationController)
  );

  // Deletar notificação específica
  fastify.delete<{ Params: { uuid: string; notificationId: string } }>(
    "/users/:uuid/notifications/:notificationId",
    {
      preHandler: [fastify.authenticate, fastify.authorize("self")],
    },
    userNotificationController.deleteNotification.bind(
      userNotificationController
    )
  );

  // Deletar todas as notificações do usuário
  fastify.delete<{ Params: { uuid: string } }>(
    "/users/:uuid/notifications",
    {
      preHandler: [fastify.authenticate, fastify.authorize("self")],
    },
    userNotificationController.deleteAllNotifications.bind(
      userNotificationController
    )
  );
};
