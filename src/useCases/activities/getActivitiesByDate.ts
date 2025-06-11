import { IActivityResponse } from "../../interfaces/activity";
import { IActivityRepository } from "../../repositories/ActivityRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getActivitiesByDate(
    date: string, 
    activityRepository: IActivityRepository
): Promise<IActivityResponse[]> {
    try {
      if (!date || isNaN(Date.parse(date))) {
        throw new Error('Data inválida');
      }

      const activities = await activityRepository.getByDate(date);
      return activities
    } catch (error) {
      throw handleError(error, 'Erro ao buscar atividades por data');
    }
  }