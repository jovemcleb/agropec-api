import { ICreateNotification, INotification, INotificationResponse } from "../../interfaces/notification";
import { INotificationRepository } from "../../repositories/NotificationRepository";
import { handleError } from "../../utils/formatter-activity";


export async function createNotification(
  notificationData: ICreateNotification,
  notificationRepository: INotificationRepository //criar inteface
) : Promise<INotificationResponse>{
  
  try {
    return await notificationRepository.create(notificationData)
  } catch (error) {
        throw handleError(error, "Erro ao criar notificação");
    
  }
}