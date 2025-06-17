import { INotificationResponse } from "../../interfaces/notification";
import { INotificationRepository } from "../../repositories/NotificationRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getAllNotifications(
  notificationRepository: INotificationRepository
) : Promise<INotificationResponse[]>{
 try {
   return await notificationRepository.getAll();
 } catch (error) {
      throw handleError(error, 'Erro ao buscar notificações');
  
 }
}