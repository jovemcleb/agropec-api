import schedule from "node-schedule";
import { INotification } from "../interfaces/notification";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { WebSocketManager } from "./WebSocketManager";

export class GlobalNotificationService {
  constructor(
    private notificationRepository: NotificationRepository,
    private wsManager: WebSocketManager
  ) {}

  async scheduleGlobalNotification(notification: INotification): Promise<void> {
    // Se a notificação já foi entregue ou lida, não envia novamente
    if (notification.status === "delivered" || notification.status === "read") {
      return;
    }

    const notificationDateTime = new Date(
      `${notification.date.split("/").reverse().join("-")}T${notification.time}`
    );

    // Se não for agendada ou a data já passou, envia imediatamente
    if (!notification.isScheduled || notificationDateTime <= new Date()) {
      this.wsManager?.broadcastNotification(
        notification,
        notification.targetAudience
      );
      // Atualizar status para delivered após envio imediato
      await this.notificationRepository.update(notification.uuid, {
        ...notification,
        status: "delivered",
      });
      return;
    }

    // Se for agendada e a data é futura, agenda o envio
    schedule.scheduleJob(notificationDateTime, async () => {
      // Verifica novamente o status antes de enviar
      const currentNotification = await this.notificationRepository.getByUuid(
        notification.uuid
      );
      if (
        currentNotification &&
        (currentNotification.status === "delivered" ||
          currentNotification.status === "read")
      ) {
        return;
      }

      this.wsManager?.broadcastNotification(
        notification,
        notification.targetAudience
      );
      // Atualizar status para delivered após envio agendado
      await this.notificationRepository.update(notification.uuid, {
        ...notification,
        status: "delivered",
      });
    });
  }

  async rescheduleActiveNotifications(): Promise<void> {
    const activeNotifications = await this.notificationRepository.getActive();

    for (const notification of activeNotifications) {
      if (notification.isScheduled && notification.status === "pending") {
        await this.scheduleGlobalNotification(notification);
      }
    }
  }
}
