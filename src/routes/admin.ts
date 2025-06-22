import { FastifyPluginAsync } from "fastify";
import { AdminController } from "../controllers/AdminController";
import {
  IAdmin,
  CreateAdminSchema,
  ICreateAdmin,
  ILoginInput,
  LoginSchema,
  IUpdateAdmin,
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
    { preHandler: fastify.validateSchema({ body: CreateAdminSchema }) },
    adminController.signup.bind(adminController)
  );
  fastify.get(
    "/admins",
    { preHandler: [fastify.authenticate] },
    adminController.findAll.bind(adminController)
  );
  fastify.patch<{ Params: { uuid: string }; Body: IUpdateAdmin }>(
    "/admin/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.validateSchema({ body: UpdateAdminSchema }), 
      ],
    },
    adminController.update.bind(adminController)
  );
  fastify.delete<{ Params: { uuid: string } }>(
    "/admin/:uuid",
    { preHandler: [fastify.authenticate] },
    adminController.delete.bind(adminController)
  );
};
