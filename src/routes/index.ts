import { FastifyPluginAsync } from "fastify";
import { validationPlugin } from "../plugins/validation";
import { activityRoutes } from "./activities";
import { adminRoutes } from "./admin";
import { categoriesRoutes } from "./categories";
import { companiesRoutes } from "./companies";
import { highlightRoutes } from "./highlights";
import { notificationsRoutes } from "./notifications";
import { scheduleRoutes } from "./schedule";
import { standRoutes } from "./stands";
import { userNotificationsRoutes } from "./userNotifications";
import { usersRoutes } from "./users";

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(validationPlugin);
  fastify.register(adminRoutes);
  fastify.register(companiesRoutes);
  fastify.register(categoriesRoutes);
  fastify.register(usersRoutes);
  fastify.register(userNotificationsRoutes);
  fastify.register(standRoutes);
  fastify.register(activityRoutes);
  fastify.register(highlightRoutes);
  fastify.register(notificationsRoutes);
  fastify.register(scheduleRoutes);
};
