import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { UserController } from "../controllers/UserController";
import {
  CreateUserSchema,
  ICreateUser,
  IUpdateUser,
  UpdateUserSchema,
  UserActivitiesSchema,
  UserStandsSchema,
} from "../interfaces/user";

export const usersRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const userController = new UserController(fastify.repositories.user);

  fastify.get("/users", userController.findAll.bind(userController));

  fastify.post<{ Body: ICreateUser }>(
    "/users",
    { preHandler: fastify.validateSchema({ body: CreateUserSchema }) },
    userController.create.bind(userController)
  );

  fastify.patch<{
    Params: { uuid: string };
    Body: { activitiesId: string[] };
  }>(
    "/users/:uuid/activities",
    {
      preHandler: [
        fastify.validateSchema({
          body: UserActivitiesSchema,
        }),
      ],
      onResponse: async (request, reply) => {
        const { uuid } = request.params;
        await fastify.notificationScheduler.scheduleUserEventNotifications(
          uuid
        );
      },
    },
    userController.addActivity.bind(userController)
  );

  fastify.patch<{
    Params: { uuid: string };
    Body: { standsId: string[] };
  }>(
    "/users/:uuid/stands",
    {
      preHandler: [
        fastify.validateSchema({
          body: UserStandsSchema,
        }),
      ],
      onResponse: async (request, reply) => {
        const { uuid } = request.params;
        await fastify.notificationScheduler.scheduleUserEventNotifications(
          uuid
        );
      },
    },
    userController.addStands.bind(userController)
  );

  fastify.delete<{
    Params: { uuid: string };
    Body: { activitiesId: string[] };
  }>(
    "/users/:uuid/activities",
    {
      preHandler: [
        fastify.validateSchema({
          body: UserActivitiesSchema,
        }),
      ],
      onResponse: async (request, reply) => {
        const { uuid } = request.params;
        await fastify.notificationScheduler.scheduleUserEventNotifications(
          uuid
        );
      },
    },
    userController.removeActivities.bind(userController)
  );

  fastify.delete<{
    Params: { uuid: string };
    Body: { standsId: string[] };
  }>(
    "/users/:uuid/stands",
    {
      preHandler: [
        fastify.validateSchema({
          body: UserStandsSchema,
        }),
      ],
      onResponse: async (request, reply) => {
        const { uuid } = request.params;
        await fastify.notificationScheduler.scheduleUserEventNotifications(
          uuid
        );
      },
    },
    userController.removeStands.bind(userController)
  );

  fastify.put<{ Params: { uuid: string }; Body: IUpdateUser }>(
    "/users/:uuid",
    {
      preHandler: fastify.validateSchema({
        body: UpdateUserSchema,
      }),
    },
    userController.update.bind(userController)
  );

  fastify.delete("/users/:uuid", userController.delete.bind(userController));
};
