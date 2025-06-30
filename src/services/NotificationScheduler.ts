import schedule from "node-schedule";
import { EventType, IScheduledNotification } from "../interfaces/notification";
import { ActivityRepository } from "../repositories/ActivityRepository";
import { StandRepository } from "../repositories/StandRepository";
import { UserRepository } from "../repositories/UserRepository";
import { convertDateFormat } from "../utils/date-formatter";
import { UserNotificationService } from "./UserNotificationService";

export class NotificationScheduler {
  private scheduledJobs: Map<string, schedule.Job>;

  constructor(
    private userNotificationService: UserNotificationService,
    private userRepository: UserRepository,
    private activityRepository: ActivityRepository,
    private standRepository: StandRepository
  ) {
    this.scheduledJobs = new Map();
  }

  private getJobKey(
    userId: string,
    eventId: string,
    type: "30min" | "start",
    eventType: EventType
  ): string {
    return `${userId}|:|${eventId}|:|${type}|:|${eventType}`;
  }

  private async cancelJobsAndCleanup(jobKeys: string[]): Promise<void> {
    for (const key of jobKeys) {
      const job = this.scheduledJobs.get(key);
      if (job) {
        console.log(`Cancelando job: ${key}`);
        job.cancel();
        this.scheduledJobs.delete(key);
      }
    }
  }

  private async cancelEventNotifications(
    userId: string,
    eventId: string,
    eventType: EventType
  ): Promise<void> {
    console.log(
      `🗑️ [cancelEventNotifications] Cancelando jobs para usuário ${userId}, evento ${eventId}`
    );

    const jobKeys = [
      this.getJobKey(userId, eventId, "30min", eventType),
      this.getJobKey(userId, eventId, "start", eventType),
    ];

    await this.cancelJobsAndCleanup(jobKeys);

    console.log(
      `🗑️ [cancelEventNotifications] Deletando notificações pendentes para evento ${eventId}`
    );
    await this.userNotificationService.deleteEventNotifications(
      userId,
      eventId
    );

    console.log(
      `✅ [cancelEventNotifications] Jobs e notificações processados para evento ${eventId}`
    );
  }

  private async getEventsInBatch<T>(
    repository: any,
    ids: string[]
  ): Promise<Map<string, T>> {
    const events = await Promise.all(ids.map((id) => repository.getByUuid(id)));
    return new Map(
      events.filter((event) => event).map((event) => [event.uuid, event])
    );
  }

  private async getEventDetails(eventId: string, eventType: EventType) {
    if (eventType === "activity") {
      return await this.activityRepository.getByUuid(eventId);
    }
    return await this.standRepository.getByUuid(eventId);
  }

  public getScheduledNotifications(): {
    userId: string;
    eventId: string;
    type: string;
    nextInvocation: Date | null;
    eventType: EventType;
  }[] {
    const scheduledNotifications = [];

    for (const [key, job] of this.scheduledJobs.entries()) {
      const [userId, eventId, type, eventType] = key.split("|:|");

      scheduledNotifications.push({
        userId,
        eventId,
        type,
        nextInvocation: job.nextInvocation(),
        eventType: eventType as EventType,
      });
    }

    return scheduledNotifications;
  }

  public async getScheduledNotificationsWithDetails(): Promise<
    IScheduledNotification[]
  > {
    try {
      const scheduledNotifications = this.getScheduledNotifications();

      const detailedNotifications = await Promise.all(
        scheduledNotifications.map(async (notification) => {
          const user = await this.userRepository.findByUuid(
            notification.userId
          );
          const event = await this.getEventDetails(
            notification.eventId,
            notification.eventType
          );

          return {
            ...notification,
            userName: user
              ? `${user.firstName} ${user.lastName}`
              : "Usuário não encontrado",
            eventName: event ? event.name : "Evento não encontrado",
            notificationType:
              notification.type === "30min"
                ? "30 minutos antes"
                : "Início do evento",
          };
        })
      );

      return detailedNotifications;
    } catch (error) {
      throw new Error("Erro ao buscar notificações agendadas");
    }
  }

  public async scheduleEventNotification(
    userId: string,
    eventId: string,
    eventName: string,
    eventDate: string,
    eventTime: string,
    eventType: EventType
  ): Promise<void> {
    try {
      console.log(
        `🔔 [scheduleEventNotification] Agendando para usuário ${userId}, evento ${eventId} (${eventName})`
      );

      const formattedDate = convertDateFormat(eventDate);
      const eventDateTime = new Date(`${formattedDate}T${eventTime}`);
      const thirtyMinsBefore = new Date(eventDateTime.getTime() - 30 * 60000);
      const now = new Date();

      console.log(
        `📅 [scheduleEventNotification] Data/hora do evento: ${eventDateTime.toISOString()}`
      );
      console.log(
        `⏰ [scheduleEventNotification] 30min antes: ${thirtyMinsBefore.toISOString()}`
      );

      // Cancelar jobs existentes para este evento
      await this.cancelEventNotifications(userId, eventId, eventType);

      // Buscar notificações existentes para este evento
      const existingNotifications =
        await this.userNotificationService.getUserNotifications(userId);

      console.log(
        `📋 [scheduleEventNotification] Encontradas ${existingNotifications.length} notificações existentes para o usuário`
      );

      // Agendar notificação 30 minutos antes
      if (thirtyMinsBefore > now) {
        // Verificar se já existe notificação de 30min para este evento
        const has30MinNotification = existingNotifications.some(
          (n) =>
            n.eventId === eventId &&
            n.eventType === eventType &&
            (n.status === "delivered" || n.status === "read") &&
            Math.abs(n.scheduledFor.getTime() - thirtyMinsBefore.getTime()) <
              60000 // tolerância de 1 minuto
        );

        if (!has30MinNotification) {
          console.log(
            `✅ [scheduleEventNotification] Agendando notificação 30min antes para ${thirtyMinsBefore.toISOString()}`
          );
          const job30min = schedule.scheduleJob(thirtyMinsBefore, async () => {
            console.log(
              `🔔 [Job30Min] Executando notificação 30min para evento ${eventId}`
            );
            const message = `${
              eventType === "activity" ? "A atividade" : "O stand"
            } "${eventName}" começará em 30 minutos!`;

            // Verificação dupla no momento da execução
            const currentNotifications =
              await this.userNotificationService.getUserNotifications(userId);

            const alreadyExists = currentNotifications.some(
              (n) =>
                n.eventId === eventId &&
                n.eventType === eventType &&
                (n.status === "delivered" || n.status === "read") &&
                Math.abs(
                  n.scheduledFor.getTime() - thirtyMinsBefore.getTime()
                ) < 60000
            );

            if (!alreadyExists) {
              console.log(
                `✅ [Job30Min] Criando notificação para evento ${eventId}`
              );
              await this.userNotificationService.createNotification(
                userId,
                message,
                eventId,
                eventType,
                thirtyMinsBefore
              );
            } else {
              console.log(
                `⚠️ [Job30Min] Notificação já existe para evento ${eventId}, pulando`
              );
            }
          });
          this.scheduledJobs.set(
            this.getJobKey(userId, eventId, "30min", eventType),
            job30min
          );
        } else {
          console.log(
            `⚠️ [scheduleEventNotification] Notificação 30min já existe para evento ${eventId}, pulando`
          );
        }
      } else {
        console.log(
          `⏰ [scheduleEventNotification] Horário 30min antes já passou, pulando agendamento`
        );
      }

      // Agendar notificação no início
      if (eventDateTime > now) {
        // Verificar se já existe notificação de início para este evento
        const hasStartNotification = existingNotifications.some(
          (n) =>
            n.eventId === eventId &&
            n.eventType === eventType &&
            (n.status === "delivered" || n.status === "read") &&
            Math.abs(n.scheduledFor.getTime() - eventDateTime.getTime()) < 60000 // tolerância de 1 minuto
        );

        if (!hasStartNotification) {
          console.log(
            `✅ [scheduleEventNotification] Agendando notificação de início para ${eventDateTime.toISOString()}`
          );
          const jobStart = schedule.scheduleJob(eventDateTime, async () => {
            console.log(
              `🔔 [JobStart] Executando notificação de início para evento ${eventId}`
            );
            const message = `${
              eventType === "activity" ? "A atividade" : "O stand"
            } "${eventName}" está começando agora!`;

            // Verificação dupla no momento da execução
            const currentNotifications =
              await this.userNotificationService.getUserNotifications(userId);

            const alreadyExists = currentNotifications.some(
              (n) =>
                n.eventId === eventId &&
                n.eventType === eventType &&
                (n.status === "delivered" || n.status === "read") &&
                Math.abs(n.scheduledFor.getTime() - eventDateTime.getTime()) <
                  60000
            );

            if (!alreadyExists) {
              console.log(
                `✅ [JobStart] Criando notificação para evento ${eventId}`
              );
              await this.userNotificationService.createNotification(
                userId,
                message,
                eventId,
                eventType,
                eventDateTime
              );
            } else {
              console.log(
                `⚠️ [JobStart] Notificação já existe para evento ${eventId}, pulando`
              );
            }
          });
          this.scheduledJobs.set(
            this.getJobKey(userId, eventId, "start", eventType),
            jobStart
          );
        } else {
          console.log(
            `⚠️ [scheduleEventNotification] Notificação de início já existe para evento ${eventId}, pulando`
          );
        }
      } else {
        console.log(
          `⏰ [scheduleEventNotification] Horário do evento já passou, pulando agendamento`
        );
      }

      console.log(
        `✅ [scheduleEventNotification] Agendamento concluído para evento ${eventId}`
      );
    } catch (error) {
      console.error(
        "❌ [scheduleEventNotification] Erro ao agendar notificação:",
        error
      );
    }
  }

  public async scheduleUserEventNotifications(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findByUuid(userId);
      if (!user) {
        throw new Error("User not found to schedule notifications");
      }

      // Cancelar jobs existentes do usuário
      const userJobKeys = Array.from(this.scheduledJobs.keys()).filter((key) =>
        key.startsWith(userId)
      );
      await this.cancelJobsAndCleanup(userJobKeys);

      const now = new Date();

      // Buscar todas as atividades e stands em lote
      const [activities, stands] = await Promise.all([
        user.activitiesId?.length
          ? this.getEventsInBatch(this.activityRepository, user.activitiesId)
          : new Map(),
        user.standsId?.length
          ? this.getEventsInBatch(this.standRepository, user.standsId)
          : new Map(),
      ]);

      // Agendar notificações para atividades
      if (activities.size > 0) {
        const schedulePromises = Array.from(activities.values()).map(
          (activity) => {
            const formattedDate = convertDateFormat(activity.date);
            const eventDateTime = new Date(
              `${formattedDate}T${activity.startTime}`
            );

            if (eventDateTime > now) {
              return this.scheduleEventNotification(
                userId,
                activity.uuid,
                activity.name,
                activity.date,
                activity.startTime,
                "activity"
              );
            }
          }
        );
        await Promise.all(schedulePromises.filter(Boolean));
      }

      // Agendar notificações para stands
      if (stands.size > 0) {
        const schedulePromises = Array.from(stands.values()).map((stand) => {
          const formattedDate = convertDateFormat(stand.date);
          const eventDateTime = new Date(
            `${formattedDate}T${stand.openingTime}`
          );

          if (eventDateTime > now) {
            return this.scheduleEventNotification(
              userId,
              stand.uuid,
              stand.name,
              stand.date,
              stand.openingTime,
              "stand"
            );
          }
        });
        await Promise.all(schedulePromises.filter(Boolean));
      }
    } catch (error) {
      console.error("Erro ao agendar notificações do usuário:", error);
      throw error;
    }
  }
}
