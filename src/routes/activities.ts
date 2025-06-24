import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { ActivityController } from "../controllers/ActivityController";
import {
  CreateActivitySchema,
  ICreateActivity,
  IUpdateActivity,
  UpdateActivitySchema,
} from "../interfaces/activity";

export const activityRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const activityController = new ActivityController(
    fastify.repositories.activity
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

  fastify.post<{ Body: ICreateActivity }>(
    "/activities",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("admin"),
        fastify.validateSchema({ body: CreateActivitySchema }),
      ],
    },
    activityController.createActivity.bind(activityController)
  );

  fastify.put<{
    Body: IUpdateActivity;
    Params: { uuid: string };
  }>(
    "/activities/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("admin"),
        fastify.validateSchema({ body: UpdateActivitySchema }),
      ],
    },
    activityController.updateActivity.bind(activityController)
  );

  fastify.delete<{ Params: { uuid: string } }>(
    "/activities/:uuid",
    {
      preHandler: [fastify.authenticate, fastify.authorize("admin")],
    },
    activityController.deleteActivity.bind(activityController)
  );
};
