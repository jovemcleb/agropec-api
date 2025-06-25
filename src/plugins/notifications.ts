import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { GlobalNotificationService } from "../services/GlobalNotificationService";
import { NotificationScheduler } from "../services/NotificationScheduler";
import { UserNotificationService } from "../services/UserNotificationService";

const notificationsPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  // Inicializar serviços
  const userNotificationService = new UserNotificationService(
    fastify.repositories.userNotification,
    fastify
  );

  const globalNotificationService = new GlobalNotificationService(
    fastify.repositories.notification,
    fastify.wsManager
  );

  const notificationScheduler = new NotificationScheduler(
    userNotificationService,
    fastify.repositories.user,
    fastify.repositories.activity,
    fastify.repositories.stand
  );

  // Decorar o fastify com os serviços
  fastify.decorate("userNotificationService", userNotificationService);
  fastify.decorate("notificationScheduler", notificationScheduler);
  fastify.decorate("globalNotificationService", globalNotificationService);
  fastify.decorate(
    "scheduleGlobalNotification",
    globalNotificationService.scheduleGlobalNotification.bind(
      globalNotificationService
    )
  );

  // Inicializar sistema de notificações
  console.log(`🔄 Inicializando sistema de notificações...`);

  // Reagendar notificações de usuários
  const users = await fastify.repositories.user.findAll();
  for (const user of users) {
    await notificationScheduler.scheduleUserEventNotifications(user.uuid);
  }

  // Reagendar notificações globais ativas
  await globalNotificationService.rescheduleActiveNotifications();

  console.log(`✅ Sistema de notificações inicializado com sucesso`);
};

export const notifications = fp(notificationsPlugin, {
  name: "notifications-plugin",
  dependencies: ["repositories-plugin"],
});
