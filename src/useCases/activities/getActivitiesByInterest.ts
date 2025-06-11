import { IActivityResponse } from "../../interfaces/activity";
import { IActivityRepository } from "../../repositories/ActivityRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getActivitiesByInterest(
    interest: string,
    activityRepository: IActivityRepository
): Promise<IActivityResponse[]> {
    try {
      if (!interest || interest.trim() === '') {
        throw new Error('Interesse é obrigatório para busca');
      }

      const activities = await activityRepository.getByInterest(interest);
      return activities
    } catch (error) {
      throw handleError(error, 'Erro ao buscar atividades por interesse');
    }
  }