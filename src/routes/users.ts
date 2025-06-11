import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";

interface User {
  name: string;
  email: string;
}

export const usersRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  fastify.post(
    "/users",
    async (request: FastifyRequest<{ Body: User }>, reply) => {
      const user = fastify.mongo.db?.collection("users");
      const result = await user?.insertOne(request.body);

      return result;
    }
  );
};
