import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { EventType } from "../interfaces/notification";
import { IUserNotification } from "../interfaces/userNotification";
import { UserNotificationRepository } from "../repositories/UserNotificationRepository";

export class UserNotificationService {
  constructor(
    private userNotificationRepository: UserNotificationRepository,
    private fastify: FastifyInstance
  ) {}

  async createNotification(
    userId: string,
    message: string,
    eventId: string,
    eventType: EventType,
    scheduledFor: Date
  ): Promise<void> {
    try {
      const userNotification: IUserNotification = {
        uuid: randomUUID(),
        userId,
        message,
        eventId,
        eventType,
        scheduledFor,
        status: "pending",
        createdAt: new Date(),
      };

      // Criar a notificação no banco
      await this.userNotificationRepository.create(userNotification);

      // Enviar notificação via WebSocket
      this.fastify.wsManager?.sendNotification(userId, userNotification);

      // Atualizar status para delivered após envio
      await this.userNotificationRepository.markAsDelivered(
        userNotification.uuid
      );
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      throw new Error("Falha ao criar notificação para o usuário");
    }
  }

  async deleteEventNotifications(
    userId: string,
    eventId: string
  ): Promise<void> {
    try {
      await this.userNotificationRepository.deleteByEventId(userId, eventId);
    } catch (error) {
      console.error("Erro ao deletar notificações do evento:", error);
      throw new Error("Falha ao deletar notificações do evento");
    }
  }

  async deleteUserNotifications(userId: string): Promise<void> {
    try {
      await this.userNotificationRepository.deleteByUserId(userId);
    } catch (error) {
      console.error("Erro ao deletar notificações do usuário:", error);
      throw new Error("Falha ao deletar notificações do usuário");
    }
  }

  async markAsDelivered(notificationId: string): Promise<void> {
    try {
      await this.userNotificationRepository.markAsDelivered(notificationId);
    } catch (error) {
      console.error("Erro ao marcar notificação como entregue:", error);
      throw new Error("Falha ao marcar notificação como entregue");
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.userNotificationRepository.markAsRead(notificationId);
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      throw new Error("Falha ao marcar notificação como lida");
    }
  }

  async getUserNotifications(userId: string): Promise<IUserNotification[]> {
    try {
      return await this.userNotificationRepository.findByUserId(userId);
    } catch (error) {
      console.error("Erro ao buscar notificações do usuário:", error);
      throw new Error("Falha ao buscar notificações do usuário");
    }
  }

  async getUnreadNotifications(userId: string): Promise<IUserNotification[]> {
    try {
      return await this.userNotificationRepository.getUnreadNotifications(
        userId
      );
    } catch (error) {
      console.error("Erro ao buscar notificações não lidas:", error);
      throw new Error("Falha ao buscar notificações não lidas");
    }
  }
}
