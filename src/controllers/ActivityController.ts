import { FastifyRequest, FastifyReply } from "fastify";
import { ICreateActivity, IUpdateActivity } from "../interfaces/activity";
import { getAllActivities } from "../useCases/activities/getAllActivities";
import { getActivityByUuid } from "../useCases/activities/getActivityByUuid";
import { getActivitiesByCategory } from "../useCases/activities/getActivitiesByCategory";
import { getActivitiesByName } from "../useCases/activities/getActivitiesByName";
import { getActivitiesByDate } from "../useCases/activities/getActivitiesByDate";
import { getActivitiesByInterest } from "../useCases/activities/getActivitiesByInterest";
import { createActivity } from "../useCases/activities/createActivity";
import { updateActivity } from "../useCases/activities/updateActivity";
import { deleteActivity } from "../useCases/activities/deleteActivity";
import { ActivityRepository } from "../repositories/ActivityRepository";

export class ActivityController {
  private activityRepository: ActivityRepository;

  constructor(activityRepository: ActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async getAllActivities(request: FastifyRequest, reply: FastifyReply) {
    try {
      const activities = await getAllActivities(this.activityRepository);

      reply.status(200).send({
        success: true,
        message: "Atividades encontradas",
        data: activities,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async getActivityByUuid(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const activity = await getActivityByUuid(uuid, this.activityRepository);

      if (!activity) {
        reply.status(404).send({
          success: false,
          message: "Atividade não encontrada",
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Atividade encontrada",
        data: activity,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
  async getActivitiesByCategory(
    request: FastifyRequest<{ Params: { categoryId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { categoryId } = request.params;
      const activities = await getActivitiesByCategory(
        categoryId,
        this.activityRepository
      );

      reply.status(200).send({
        success: true,
        message: "Atividades encontradas",
        data: activities,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
  async getActivitiesByName(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { name } = request.query;

      if (!name || name.trim() === "") {
        reply.status(400).send({
          success: false,
          message: 'Parâmetro de busca "name" é obrigatório',
        });
        return;
      }
      const activities = await getActivitiesByName(
        name,
        this.activityRepository
      );

      reply.status(200).send({
        success: true,
        message: "Atividades encontradas",
        data: activities,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
  async getActivitiesByDate(
    request: FastifyRequest<{ Params: { date: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { date } = request.params;
      const activities = await getActivitiesByDate(
        date,
        this.activityRepository
      );

      reply.status(200).send({
        success: true,
        message: "Atividades encontradas",
        data: activities,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
  async getActivitiesByInterest(
    request: FastifyRequest<{ Querystring: { interest: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { interest } = request.query;

      if (!interest || interest.trim() === "") {
        reply.status(400).send({
          success: false,
          message: 'Parâmetro de busca "interest" é obrigatório',
        });
        return;
      }

      const activities = await getActivitiesByInterest(
        interest,
        this.activityRepository
      );

      reply.status(200).send({
        success: true,
        message: "Atividades encontradas",
        data: activities,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async createActivity(
    request: FastifyRequest<{ Body: ICreateActivity }>,
    reply: FastifyReply
  ) {
    try {
      const activityData = request.body;
      const createdActivity = await createActivity(
        activityData,
        this.activityRepository
      );

      reply.status(201).send({
        success: true,
        message: "Atividade criada com sucesso",
        data: createdActivity,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async updateActivity(
    request: FastifyRequest<{
      Body: IUpdateActivity;
      Params: { uuid: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const updateData = request.body;

      const updatedActivity = await updateActivity(
        uuid,
        updateData,
        this.activityRepository
      );

      if (!updatedActivity) {
        reply.status(404).send({
          success: false,
          message: "Atividade não encontrada para atualização",
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Atividade atualizada com sucesso",
        data: updatedActivity,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async deleteActivity(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const deleted = await deleteActivity(uuid, this.activityRepository);

      if (!deleted) {
        reply.status(404).send({
          success: false,
          message: "Atividade não encontrada para exclusão",
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Atividade deletada com sucesso",
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
}
