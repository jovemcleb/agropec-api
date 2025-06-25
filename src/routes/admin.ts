import { FastifyPluginAsync } from "fastify";
import { AdminController } from "../controllers/AdminController";
import { IAdmin } from "../interfaces/admin";

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  const adminController = new AdminController(fastify.repositories.admin);

  fastify.post("/admin/login", adminController.login.bind(adminController));

  fastify.post("/admin/signup", adminController.signup.bind(adminController));

  fastify.get(
    "/admin",
    { preHandler: [fastify.authenticate] },
    adminController.findAll.bind(adminController)
  );

  fastify.put<{ Body: IAdmin; Params: { uuid: string } }>(
    "/admin/:uuid",
    { preHandler: [fastify.authenticate] },
    adminController.update.bind(adminController)
  );
  fastify.delete<{ Params: { uuid: string } }>(
    "/admin/:uuid",
    { preHandler: [fastify.authenticate] },
    adminController.delete.bind(adminController)
  );
};
