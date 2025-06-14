import {
  IUpdateActivity,
} from "../../interfaces/activity";
import { IActivityRepository } from "../../repositories/ActivityRepository";
import { handleError } from "../../utils/formatter-activity";

export async function updateActivity(
  uuid: string,
  updateData: IUpdateActivity,
  activityRepository: IActivityRepository
) {
  try {
    
    return await activityRepository.update(uuid, updateData);
  } catch (error) {
    throw handleError(error, "Erro ao atualizar atividade");
  }
}
