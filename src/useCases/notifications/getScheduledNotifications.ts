import { IScheduledNotification } from "../../interfaces/notification";
import { NotificationScheduler } from "../../services/NotificationScheduler";

export async function getScheduledNotifications(
  notificationScheduler: NotificationScheduler
): Promise<IScheduledNotification[]> {
  try {
    return await notificationScheduler.getScheduledNotificationsWithDetails();
  } catch (error) {
    throw new Error("Erro ao buscar notificações agendadas");
  }
}
