import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { NotificationController } from "../controllers/NotificationController";
import {
  CreateNotificationSchema,
  ICreateNotification,
  IUpdateNotification,
  UpdateNotificationSchema,
} from "../interfaces/notification";

export const notificationsRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const notificationController = new NotificationController(
    fastify.repositories.notification
  );

  fastify.post<{ Body: ICreateNotification }>(
    "/notifications",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("anyAdmin"),
        fastify.validateSchema({
          body: CreateNotificationSchema,
        }),
      ],
      onResponse: async (request, reply) => {
        const uuid = reply.notification?.uuid;

        if (!uuid) return;

        const notification = await fastify.repositories.notification.getByUuid(
          uuid
        );

        if (notification) {
          await fastify.scheduleGlobalNotification(notification);

          if (!notification.isScheduled) {
            console.log(
              "[WebSocket] Interceptando criação de notificação não agendada"
            );
            fastify.wsManager.broadcastNotification(
              notification,
              notification.targetAudience
            );
          }
        }
      },
    },
    notificationController.create.bind(notificationController)
  );

  fastify.get(
    "/notifications",
    notificationController.getAll.bind(notificationController)
  );

  fastify.put<{ Body: IUpdateNotification; Params: { uuid: string } }>(
    "/notifications/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("anyAdmin"),
        fastify.validateSchema({ body: UpdateNotificationSchema }),
      ],
    },
    notificationController.update.bind(notificationController)
  );

  fastify.delete<{ Params: { uuid: string } }>(
    "/notifications/:uuid",
    {
      preHandler: [fastify.authenticate, fastify.authorize("anyAdmin")],
    },
    notificationController.delete.bind(notificationController)
  );

  fastify.get(
    "/notifications/scheduled",
    {
      preHandler: [fastify.authenticate],
    },
    notificationController.getScheduledNotifications.bind(
      notificationController
    )
  );
};
