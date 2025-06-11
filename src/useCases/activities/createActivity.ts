import {
  CreateActivitySchema,
  IActivityResponse,
  ICreateActivity,
} from "../../interfaces/activity";
import { IActivityRepository } from "../../repositories/ActivityRepository";
import { handleError } from "../../utils/formatter-activity";

export async function createActivity(
  activityData: ICreateActivity,
  activityRepository: IActivityRepository
): Promise<IActivityResponse> {
  try {
    return await activityRepository.create(activityData);
  } catch (error) {
    throw handleError(error, "Erro ao criar atividade");
  }
}
