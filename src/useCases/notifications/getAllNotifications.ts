import { INotificationResponse } from "../../interfaces/notification";
import { INotificationRepository } from "../../repositories/NotificationRepository";

export async function getAllNotifications(
  notificationRepository: INotificationRepository
): Promise<INotificationResponse[]> {
  try {
    return await notificationRepository.getAll();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Erro ao buscar notificações");
  }
}
