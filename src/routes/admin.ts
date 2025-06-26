import { FastifyPluginAsync } from "fastify";
import { AdminController } from "../controllers/AdminController";
import {
  CreateAdminSchema,
  ICreateAdmin,
  ILoginInput,
  IUpdateAdmin,
  LoginSchema,
  UpdateAdminSchema,
} from "../interfaces/admin";

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  const adminController = new AdminController(fastify.repositories.admin);

  fastify.post<{ Body: ILoginInput }>(
    "/admin/login",
    { preHandler: fastify.validateSchema({ body: LoginSchema }) },
    adminController.login.bind(adminController)
  );

  fastify.post<{ Body: ICreateAdmin }>(
    "/admin/signup",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("superAdmin"),
        fastify.validateSchema({ body: CreateAdminSchema }),
      ],
    },
    adminController.signup.bind(adminController)
  );
  fastify.get(
    "/admins",
    { preHandler: [fastify.authenticate, fastify.authorize("anyAdmin")] },
    adminController.findAll.bind(adminController)
  );
  fastify.put<{ Params: { uuid: string }; Body: IUpdateAdmin }>(
    "/admin/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("selfOrAnyAdmin"),
        fastify.validateSchema({ body: UpdateAdminSchema }),
      ],
    },
    adminController.update.bind(adminController)
  );
  fastify.delete<{ Params: { uuid: string } }>(
    "/admin/:uuid",
    { preHandler: [fastify.authenticate, fastify.authorize("superAdmin")] },
    adminController.delete.bind(adminController)
  );
};
