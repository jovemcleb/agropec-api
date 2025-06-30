import { FastifyReply, FastifyRequest } from "fastify";
import { ActivityRepository } from "../repositories/ActivityRepository";
import { StandRepository } from "../repositories/StandRepository";
import { UserRepository } from "../repositories/UserRepository";
import { getSchedule } from "../useCases/schedule/getSchedule";
import { getUserSchedule } from "../useCases/schedule/getUserSchedule";

export class ScheduleController {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly standRepository: StandRepository,
    private readonly userRepository: UserRepository
  ) {}

  async getSchedule() {
    try {
      const schedule = await getSchedule(
        this.activityRepository,
        this.standRepository
      );

      return schedule;
    } catch (error) {
      console.error("Error getting schedule:", error);
      throw error;
    }
  }

  async getUserSchedule(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const schedule = await getUserSchedule(
        uuid,
        this.userRepository,
        this.activityRepository,
        this.standRepository
      );

      return {
        success: true,
        message: "Programação do usuário encontrada com sucesso",
        data: schedule,
      };
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
}
