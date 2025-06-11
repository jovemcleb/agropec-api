import {
  IActivityResponse,
  IUpdateActivity,
  UpdateActivitySchema,
} from "../../interfaces/activity";
import { IActivityRepository } from "../../repositories/ActivityRepository";
import { handleError, validateTimeRange } from "../../utils/formatter-activity";

export async function updateActivity(
  uuid: string,
  updateData: IUpdateActivity,
  activityRepository: IActivityRepository
): Promise<IActivityResponse | null> {
  try {
    if (!uuid || uuid.trim() === "") {
      throw new Error("UUID é obrigatório");
    }

    return await activityRepository.update(uuid, updateData);
  } catch (error) {
    throw handleError(error, "Erro ao atualizar atividade");
  }
}
