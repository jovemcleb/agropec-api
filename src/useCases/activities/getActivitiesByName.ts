import { IActivityResponse } from "../../interfaces/activity";
import { IActivityRepository } from "../../repositories/ActivityRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getActivitiesByName(
  name: string,
  activityRepository: IActivityRepository
): Promise<IActivityResponse[]> {
  try {
    if (!name || name.trim() === "") {
      throw new Error("Nome é obrigatório para busca");
    }

    const activities = await activityRepository.getByName(name);
    return activities;
  } catch (error) {
    throw handleError(error, "Erro ao buscar atividades por nome");
  }
}
