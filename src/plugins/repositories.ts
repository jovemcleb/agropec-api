import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

import { ActivityRepository } from "../repositories/ActivityRepository";
import { AdminRepository } from "../repositories/AdminRepository";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { StandRepository } from "../repositories/StandRepository";
import { UserRepository } from "../repositories/UserRepository";
import { NotificationRepository } from "../repositories/NotificationRepository";

const repositoriesPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  console.log("Mongo disponível?", !!fastify.mongo);

  if (!fastify.mongo) {
    console.error("MongoDB não está disponível!");
    throw new Error("MongoDB plugin not available");
  }

  try {
    const repositories = {
      activity: new ActivityRepository(fastify),
      category: new CategoryRepository(fastify),
      company: new CompanyRepository(fastify),
      stand: new StandRepository(fastify),
      admin: new AdminRepository(fastify),
      user: new UserRepository(fastify),
      notification: new NotificationRepository(fastify), 
    };

    fastify.decorate("repositories", repositories);

    console.log("Repositories criados:", Object.keys(repositories));
  } catch (error) {
    console.error("Erro ao criar repositories:", error);
    throw error;
  }
};
export const repositories = fp(repositoriesPlugin, {
  name: "repositories-plugin",
  dependencies: ["@fastify/mongodb"],
});
