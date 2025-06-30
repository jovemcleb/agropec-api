import { IUpdateNotification } from "../../interfaces/notification";
import { NotificationRepository } from "../../repositories/NotificationRepository";
import { handleError } from "../../utils/formatter-activity";

export async function updateNotification(
  uuid: string,
  updateData: IUpdateNotification,
  notificationRepository: NotificationRepository
) {
  try {
    // Buscar notificação atual para determinar o status correto
    const currentNotification = await notificationRepository.getByUuid(uuid);
    if (!currentNotification) {
      throw new Error("Notificação não encontrada para atualização");
    }

    // Filtrar campos undefined para evitar salvar como null no MongoDB
    const filteredUpdateData: any = {};

    Object.keys(updateData).forEach((key) => {
      const value = (updateData as any)[key];
      if (value !== undefined) {
        filteredUpdateData[key] = value;
      }
    });

    // Definir status automaticamente baseado no contexto se não foi fornecido
    if (updateData.status === undefined) {
      const finalIsScheduled =
        updateData.isScheduled !== undefined
          ? updateData.isScheduled
          : currentNotification.isScheduled;

      if (finalIsScheduled) {
        // Se a notificação é agendada, deve estar pending
        filteredUpdateData.status = "pending";
      } else {
        // Se a notificação não é agendada (instantânea), manter o status atual ou delivered se já foi enviada
        filteredUpdateData.status = currentNotification.status || "delivered";
      }
    }

    // Sempre incluir updatedAt
    filteredUpdateData.updatedAt = new Date();

    return await notificationRepository.update(uuid, filteredUpdateData);
  } catch (error) {
    throw handleError(error, "Erro ao atualizar notificações");
  }
}
