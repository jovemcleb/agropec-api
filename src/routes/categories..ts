import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CategoryController } from "../controllers/CategoryController";

export const categoriesRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const categoryController = new CategoryController(
    fastify.repositories.category
  );

  fastify.post(
    "/categories",
    categoryController.create.bind(categoryController)
  );
  fastify.get(
    "/categories",
    categoryController.findAll.bind(categoryController)
  );
  fastify.put(
    "/categories/:uuid",
    categoryController.update.bind(categoryController)
  );
  fastify.delete(
    "/categories/:uuid",
    categoryController.delete.bind(categoryController)
  );
};
