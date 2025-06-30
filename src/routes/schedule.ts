import { FastifyInstance } from "fastify";
import { ScheduleController } from "../controllers/ScheduleController";
import { ActivityRepository } from "../repositories/ActivityRepository";
import { StandRepository } from "../repositories/StandRepository";
import { UserRepository } from "../repositories/UserRepository";

export async function scheduleRoutes(fastify: FastifyInstance) {
  const activityRepository = new ActivityRepository(fastify);
  const standRepository = new StandRepository(fastify);
  const userRepository = new UserRepository(fastify);
  const scheduleController = new ScheduleController(
    activityRepository,
    standRepository,
    userRepository
  );

  // Rota pública para buscar toda a programação
  fastify.get(
    "/schedule",
    scheduleController.getSchedule.bind(scheduleController)
  );

  // Rota autenticada para buscar a programação do usuário
  fastify.get<{ Params: { uuid: string } }>(
    "/schedule/user/:uuid",
    {
      preHandler: [fastify.authenticate, fastify.authorize("selfOrAnyAdmin")],
    },
    scheduleController.getUserSchedule.bind(scheduleController)
  );
}
