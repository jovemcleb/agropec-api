import { FastifyReply, FastifyRequest } from "fastify";
import {
  ICreateNotification,
  IUpdateNotification,
  INotificationResponse,
} from "../interfaces/notification";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { updateNotification } from "../useCases/notifications/updateNotification";
import { createNotification } from "../useCases/notifications/createNotification";
import { getAllNotifications } from "../useCases/notifications/getAllNotification";
import { deleteNotification } from "../useCases/notifications/deleteNotification";

export class NotificationController {
  private notificationRepository: NotificationRepository;

  constructor(notificationRepository: NotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async create(
    request: FastifyRequest<{ Body: ICreateNotification }>,
    reply: FastifyReply
  ) {
    try {
      const notificationData = request.body;
      const createdNotification = await createNotification(
        notificationData,
        this.notificationRepository
      );

      reply.status(201).send({
        success: true,
        message: "Notificação criada com sucesso",
        data: createdNotification,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const notifications = await getAllNotifications(
        this.notificationRepository
      );

      reply.status(200).send({
        success: true,
        message: "Notificações encontradas",
        data: notifications,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async update(
    request: FastifyRequest<{
      Body: IUpdateNotification;
      Params: { uuid: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const updateData = request.body;

      const updatedNotification = (await updateNotification(
        uuid,
        updateData,
        this.notificationRepository
      )) as INotificationResponse;

      if (!updatedNotification) {
        reply.status(404).send({
          success: false,
          message: "Notificação não encontrada para atualização",
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Notificação atualizada com sucesso",
        data: updatedNotification,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
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
      const deleted = await deleteNotification(
        uuid,
        this.notificationRepository
      );

      if (!deleted) {
        reply.status(404).send({
          success: false,
          message: "Notificação não encontrada para exclusão",
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Notificação deletada com sucesso",
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