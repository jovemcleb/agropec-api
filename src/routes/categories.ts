import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CategoryController } from "../controllers/CategoryController";
import { CreateCategorySchema, ICreateCategory } from "../interfaces/category";

export const categoriesRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const categoryController = new CategoryController(
    fastify.repositories.category
  );

  fastify.post<{ Body: ICreateCategory }>(
    "/categories",
    {
      preHandler: [
        fastify.authenticate,
        fastify.validateSchema({ body: CreateCategorySchema }),
      ],
    },
    categoryController.create.bind(categoryController)
  );
  fastify.get(
    "/categories",
    categoryController.findAll.bind(categoryController)
  );

  fastify.put<{ Body: ICreateCategory; Params: { uuid: string } }>(
    "/categories/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.validateSchema({ body: CreateCategorySchema }),
      ],
    },
    categoryController.update.bind(categoryController)
  );
  fastify.delete<{ Params: { uuid: string } }>(
    "/categories/:uuid",
    {
      preHandler: fastify.authenticate,
    },
    categoryController.delete.bind(categoryController)
  );
};
