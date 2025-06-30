import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { ActivityController } from "../controllers/ActivityController";
import {
  ICreateActivity,
  IUpdateActivity,
  UpdateActivitySchema,
} from "../interfaces/activity";

export const activityRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const activityController = new ActivityController(
    fastify.repositories.activity,
    fastify.imageUpload
  );

  fastify.get(
    "/activities",
    activityController.getAllActivities.bind(activityController)
  );

  fastify.get(
    "/activities/uuid/:uuid",
    activityController.getActivityByUuid.bind(activityController)
  );

  fastify.get(
    "/activities/category/:categoryId",
    activityController.getActivitiesByCategory.bind(activityController)
  );

  fastify.get(
    "/activities/name",
    activityController.getActivitiesByName.bind(activityController)
  );

  fastify.get(
    "/activities/date/:date",
    activityController.getActivitiesByDate.bind(activityController)
  );

  fastify.get(
    "/activities/interest",
    activityController.getActivitiesByInterest.bind(activityController)
  );

  fastify.post<{ Body: ICreateActivity }>("/activities", {
    preHandler: [fastify.authenticate, fastify.authorize("anyAdmin")],
    handler: activityController.createActivity.bind(activityController),
  });

  fastify.put<{
    Body: IUpdateActivity;
    Params: { uuid: string };
  }>(
    "/activities/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("anyAdmin"),
        fastify.validateSchema({ body: UpdateActivitySchema }),
      ],
      onResponse: async (request, reply) => {
        const users = await fastify.repositories.user.findByActivity(
          request.params.uuid
        );

        for (const user of users) {
          await fastify.notificationScheduler.scheduleUserEventNotifications(
            user.uuid
          );
        }
      },
    },
    activityController.updateActivity.bind(activityController)
  );

  fastify.delete<{ Params: { uuid: string } }>(
    "/activities/:uuid",
    {
      preHandler: [fastify.authenticate, fastify.authorize("anyAdmin")],
    },
    activityController.deleteActivity.bind(activityController)
  );
};
