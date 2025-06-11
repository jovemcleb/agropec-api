import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { ActivityController } from "../controllers/ActivityController";
import {
  CreateActivitySchema,
  UpdateActivitySchema,
} from "../interfaces/activity";

export const activityRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  if (!fastify.repositories || !fastify.repositories.activity) {
    fastify.log.error(
      "Activity repository not found on fastify instance. Check plugin registration."
    );
    throw new Error(
      "Activity repository is not available. Ensure 'repositories-plugin' is registered before routes and has no errors."
    );
  }

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
    "/activities/name/:name",
    activityController.getActivitiesByName.bind(activityController)
  );

  fastify.get(
    "/activities/date/:date",
    activityController.getActivitiesByDate.bind(activityController)
  );

  fastify.get(
    "/activities/interest/:interest",
    activityController.getActivitiesByInterest.bind(activityController)
  );

  fastify.post(
    "/activities",
    {
      preHandler: fastify.validateSchema({
        body: CreateActivitySchema,
      }),
    },
    activityController.createActivity.bind(activityController)
  );

  fastify.put(
    "/activities/:uuid",
    {
      preHandler: fastify.validateSchema({
        body: UpdateActivitySchema,
      }),
    },
    activityController.updateActivity.bind(activityController)
  );

  fastify.delete(
    "/activities/:uuid",
    activityController.deleteActivity.bind(activityController)
  );
};
