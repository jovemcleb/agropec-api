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
      onResponse: async (request, reply) => {
        const { uuid } = request.params;

        const notification = await fastify.repositories.notification.getByUuid(
          uuid
        );

        if (notification) {
          await fastify.scheduleGlobalNotification(notification);

          if (!notification.isScheduled && notification.status === "pending") {
            console.log(
              "[WebSocket] Interceptando atualização de notificação para instantânea"
            );
            fastify.wsManager.broadcastNotification(
              notification,
              notification.targetAudience
            );
          }
        }
      },
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

  // Rota para reagendar manualmente uma notificação
  fastify.post<{ Params: { uuid: string } }>(
    "/notifications/:uuid/reschedule",
    {
      preHandler: [fastify.authenticate, fastify.authorize("anyAdmin")],
    },
    async (request, reply) => {
      try {
        const { uuid } = request.params;

        // Buscar a notificação
        const notification = await fastify.repositories.notification.getByUuid(
          uuid
        );

        if (!notification) {
          return reply.status(404).send({
            success: false,
            message: "Notificação não encontrada",
          });
        }

        // Reagendar a notificação
        await fastify.scheduleGlobalNotification(notification);

        reply.status(200).send({
          success: true,
          message: "Notificação reagendada com sucesso",
          data: notification,
        });
      } catch (error) {
        if (error instanceof Error) {
          reply.status(500).send({ error: error.message });
        } else {
          reply.status(500).send({ error: "Internal Server Error" });
        }
      }
    }
  );
};
