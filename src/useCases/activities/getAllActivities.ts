import { IActivityResponse } from "../../interfaces/activity";
import { IActivityRepository } from "../../repositories/ActivityRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getAllActivities(
  activityRepository: IActivityRepository
): Promise<IActivityResponse[]> {
  try {
    return await activityRepository.getAll();
  } catch (error) {
    throw handleError(error, "Erro ao buscar atividades");
  }
}
