import { IUpdateNotification } from "../../interfaces/notification";
import { NotificationRepository } from "../../repositories/NotificationRepository";
import { handleError } from "../../utils/formatter-activity";

export async function updateNotification(
  uuid: string,
  updateData: IUpdateNotification,
  notificationRepository: NotificationRepository
) {
  try {
    return await notificationRepository.update(uuid, updateData);
  } catch (error) {
    throw handleError(error, "Erro ao atualizar notificações");
  }
}
