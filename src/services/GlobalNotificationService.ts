import schedule from "node-schedule";
import { INotification } from "../interfaces/notification";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { WebSocketManager } from "./WebSocketManager";

export class GlobalNotificationService {
  private scheduledJobs: Map<string, schedule.Job> = new Map();

  constructor(
    private notificationRepository: NotificationRepository,
    private wsManager: WebSocketManager
  ) {}

  async scheduleGlobalNotification(notification: INotification): Promise<void> {
    // Cancelar job anterior se existir
    const existingJob = this.scheduledJobs.get(notification.uuid);
    if (existingJob) {
      console.log(
        `[Notification] Cancelando job anterior para notificação ${notification.uuid}`
      );
      existingJob.cancel();
      this.scheduledJobs.delete(notification.uuid);
    }

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
    console.log(
      `[Notification] Agendando notificação ${notification.uuid} para ${notificationDateTime}`
    );
    const job = schedule.scheduleJob(notificationDateTime, async () => {
      console.log(
        `[Notification] Executando job agendado para notificação ${notification.uuid}`
      );

      // Verifica novamente o status antes de enviar
      const currentNotification = await this.notificationRepository.getByUuid(
        notification.uuid
      );
      if (
        currentNotification &&
        (currentNotification.status === "delivered" ||
          currentNotification.status === "read")
      ) {
        console.log(
          `[Notification] Notificação ${notification.uuid} já foi entregue/lida, pulando envio`
        );
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

      // Remover job do Map após execução
      this.scheduledJobs.delete(notification.uuid);
    });

    // Armazenar o job no Map
    this.scheduledJobs.set(notification.uuid, job);
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
