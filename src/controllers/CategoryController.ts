import { FastifyReply, FastifyRequest } from "fastify";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { createCategory } from "../useCases/categories/createCategory";
import { deleteCategory } from "../useCases/categories/deleteCategory";
import { findAllCategories } from "../useCases/categories/findAllCategories";
import { updateCategory } from "../useCases/categories/updateCategory";

interface CategoryRequestBody {
  name: string;
}

export class CategoryController {
  constructor(private categoryRepository: CategoryRepository) {}

  async create(
    request: FastifyRequest<{ Body: CategoryRequestBody }>,
    reply: FastifyReply
  ) {
    try {
      const { name } = request.body;

      const category = await createCategory(name, this.categoryRepository);

      reply.status(201).send(category);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const categories = await findAllCategories(this.categoryRepository);

      reply.status(200).send(categories);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async update(
    request: FastifyRequest<{
      Body: CategoryRequestBody;
      Params: { uuid: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const { name } = request.body;

      const updatedCategory = await updateCategory(
        { uuid, name },
        this.categoryRepository
      );

      reply.status(200).send(updatedCategory);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;

      const deletedCategory = await deleteCategory(
        uuid,
        this.categoryRepository
      );

      reply.status(200).send(deletedCategory);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
}
