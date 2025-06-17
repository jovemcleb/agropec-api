import { INotificationRepository } from "../../repositories/NotificationRepository";
import { handleError } from "../../utils/formatter-activity";

export async function deleteNotification(
  uuid: string,
  notificationRepository: INotificationRepository
) : Promise<boolean> {
try {
  return await notificationRepository.delete(uuid)
} catch (error) {
  throw handleError(error, 'Erro ao deletar notificações');
}
}