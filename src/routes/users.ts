import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { UserController } from "../controllers/UserController";
import {
  CreateUserSchema,
  ICreateUser,
  ILoginInput,
  IUpdateUser,
  LoginSchema,
  UpdateUserSchema,
  UserActivitiesSchema,
  UserStandsSchema,
} from "../interfaces/user";

export const usersRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const userController = new UserController(fastify.repositories.user);

  // Rotas públicas
  fastify.post<{ Body: ILoginInput }>(
    "/users/login",
    { preHandler: fastify.validateSchema({ body: LoginSchema }) },
    userController.login.bind(userController)
  );

  fastify.post<{ Body: ICreateUser }>(
    "/users/signup",
    { preHandler: fastify.validateSchema({ body: CreateUserSchema }) },
    userController.signup.bind(userController)
  );

  // Rotas que requerem autenticação e autorização
  fastify.patch<{
    Params: { uuid: string };
    Body: { activitiesId: string[] };
  }>(
    "/users/:uuid/activities",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("self"),
        fastify.validateSchema({ body: UserActivitiesSchema }),
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
        fastify.authenticate,
        fastify.authorize("self"),
        fastify.validateSchema({ body: UserStandsSchema }),
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

  fastify.patch<{
    Params: { uuid: string };
    Body: { activitiesId: string[] };
  }>(
    "/users/:uuid/activities/remove",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("self"),
        fastify.validateSchema({ body: UserActivitiesSchema }),
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

  fastify.patch<{
    Params: { uuid: string };
    Body: { standsId: string[] };
  }>(
    "/users/:uuid/stands/remove",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("self"),
        fastify.validateSchema({ body: UserStandsSchema }),
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

  fastify.patch<{ Params: { uuid: string }; Body: IUpdateUser }>(
    "/users/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("selfOrAnyAdmin"),
        fastify.validateSchema({ body: UpdateUserSchema }),
      ],
    },
    userController.update.bind(userController)
  );

  fastify.delete<{ Params: { uuid: string } }>(
    "/users/:uuid",
    {
      preHandler: [fastify.authenticate, fastify.authorize("selfOrSuperAdmin")],
    },
    userController.delete.bind(userController)
  );

  // Rota administrativa para listar todos os usuários
  fastify.get(
    "/users",
    {
      preHandler: [fastify.authenticate, fastify.authorize("anyAdmin")],
    },
    userController.findAll.bind(userController)
  );
};
