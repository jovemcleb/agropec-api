import { FastifyPluginAsync } from "fastify";
import { adminRoutes } from "./admin";
import { categoriesRoutes } from "./categories";
import { companiesRoutes } from "./companies";
import { standRoutes } from "./stands";
import { usersRoutes } from "./users";
import { activityRoutes } from "./activities";
import { validationPlugin } from "../plugins/validation";

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(validationPlugin);
  fastify.register(adminRoutes);
  fastify.register(companiesRoutes);
  fastify.register(categoriesRoutes);
  fastify.register(usersRoutes);
  fastify.register(standRoutes);
  fastify.register(activityRoutes);
};
