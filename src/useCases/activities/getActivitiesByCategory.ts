import { IActivityResponse } from "../../interfaces/activity";
import { IActivityRepository } from "../../repositories/ActivityRepository";
import { handleError } from "../../utils/formatter-activity";

 export async function getActivitiesByCategory(
    categoryId: string, 
    activityRepository: IActivityRepository
): Promise<IActivityResponse[]> {
    try {
      if (!categoryId || categoryId.trim() === '') {
        throw new Error('ID da categoria é obrigatório');
      }

      const activities = await activityRepository.getByCategory(categoryId);
      return activities
    } catch (error) {
      throw handleError(error, 'Erro ao buscar atividades por categoria');
    }
  }
