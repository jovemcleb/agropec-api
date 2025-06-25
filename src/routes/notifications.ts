import { FastifyInstance, FastifyPluginAsync } from "fastify";
import {
  CreateNotificationSchema,
  ICreateNotification,
  IUpdateNotification,
  UpdateNotificationSchema,
} from "../interfaces/notification";
import { NotificationController } from "../controllers/NotificationController";

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
};
