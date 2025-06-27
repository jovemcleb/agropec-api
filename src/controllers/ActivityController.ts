import { randomUUID } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateActivitySchema,
  IUpdateActivity,
  IUpdateActivityImages,
} from "../interfaces/activity";
import { ActivityRepository } from "../repositories/ActivityRepository";
import { ImageUploadService } from "../services/ImageUploadService";
import { createActivity } from "../useCases/activities/createActivity";
import { deleteActivity } from "../useCases/activities/deleteActivity";
import { getActivitiesByCategory } from "../useCases/activities/getActivitiesByCategory";
import { getActivitiesByDate } from "../useCases/activities/getActivitiesByDate";
import { getActivitiesByInterest } from "../useCases/activities/getActivitiesByInterest";
import { getActivitiesByName } from "../useCases/activities/getActivitiesByName";
import { getActivityByUuid } from "../useCases/activities/getActivityByUuid";
import { getAllActivities } from "../useCases/activities/getAllActivities";
import { updateActivity } from "../useCases/activities/updateActivity";

export class ActivityController {
  constructor(
    private activityRepository: ActivityRepository,
    private imageUploadService: ImageUploadService
  ) {}

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

  async createActivity(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Gerar UUID antes do upload
      const activityUuid = randomUUID();

      // Processar imagem e dados da atividade, passando o UUID
      const activityData = await this.imageUploadService.handleActivityCreation(
        request,
        activityUuid
      );

      // Validar dados
      const validatedData = CreateActivitySchema.parse(activityData);

      // Criar atividade com o UUID gerado
      const createdActivity = await createActivity(
        validatedData,
        this.activityRepository,
        activityUuid
      );

      reply.status(201).send({
        success: true,
        message: "Atividade criada com sucesso",
        data: createdActivity,
      });
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
      if (error instanceof Error) {
        reply.status(500).send({
          success: false,
          message: "Erro ao criar atividade",
          error: error.message,
        });
      } else {
        reply.status(500).send({
          success: false,
          message: "Erro interno ao criar atividade",
        });
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

      // Buscar atividade atual para verificar imagens existentes
      const currentActivity = await this.activityRepository.getByUuid(uuid);
      if (!currentActivity) {
        reply.status(404).send({
          success: false,
          message: "Atividade não encontrada para atualização",
        });
        return;
      }

      // Processar novas imagens se fornecidas, passando o UUID da atividade
      const activityData = await this.imageUploadService.handleActivityUpdate(
        request,
        currentActivity.imageUrls,
        uuid
      );

      const updatedActivity = await updateActivity(
        uuid,
        activityData,
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

      // Buscar atividade para obter URLs das imagens
      const activity = await this.activityRepository.getByUuid(uuid);
      if (!activity) {
        reply.status(404).send({
          success: false,
          message: "Atividade não encontrada para exclusão",
        });
        return;
      }

      // Deletar as imagens do S3 se existirem
      if (activity.imageUrls && activity.imageUrls.length > 0) {
        await this.imageUploadService.deleteImages(activity.imageUrls);
      }

      // Deletar a atividade do banco de dados
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

  async updateActivityImage(
    request: FastifyRequest<{
      Params: { uuid: string };
      Body: IUpdateActivityImages;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;

      // Buscar atividade atual para verificar imagens existentes
      const currentActivity = await this.activityRepository.getByUuid(uuid);
      if (!currentActivity) {
        reply.status(404).send({
          success: false,
          message: "Atividade não encontrada para atualização",
        });
        return;
      }

      // Extrair imageIds do multipart/form-data se for multipart
      let newImageIds: string[] | undefined;

      if (request.isMultipart()) {
        // Para multipart, vamos deixar handleActivityUpdate lidar com tudo
        newImageIds = undefined; // Será extraído dentro do handleActivityUpdate
      } else {
        // Se não é multipart, usar request.body
        newImageIds = request.body?.imageIds;
      }

      // Se não é multipart e não foram fornecidos IDs, retornar erro
      if (
        !request.isMultipart() &&
        (!newImageIds || newImageIds.length === 0)
      ) {
        reply.status(400).send({
          success: false,
          message: "Nenhuma imagem fornecida para atualização",
        });
        return;
      }

      // Processar novas imagens se fornecidas, passando o UUID da atividade e IDs das imagens
      const uploadResult = await this.imageUploadService.handleActivityUpdate(
        request,
        currentActivity.imageUrls || [],
        uuid,
        newImageIds
      );

      // Atualizar apenas as imageUrls da atividade
      const updatedActivity = await updateActivity(
        uuid,
        { imageUrls: uploadResult.imageUrls },
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
        message: "Imagens da atividade atualizadas com sucesso",
        data: updatedActivity,
      });
    } catch (error) {
      console.error("Erro ao atualizar imagens da atividade:", error);
      if (error instanceof Error) {
        reply.status(500).send({
          success: false,
          message: "Erro ao atualizar imagens da atividade",
          error: error.message,
        });
      } else {
        reply.status(500).send({
          success: false,
          message: "Erro interno ao atualizar imagens da atividade",
        });
      }
    }
  }
}
