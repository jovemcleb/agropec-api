import { IActivityRepository } from '../../repositories/ActivityRepository';
import { IActivityResponse } from '../../interfaces/activity';
import { handleError } from '../../utils/formatter-activity';

export async function getAllActivities(
  activityRepository: IActivityRepository
): Promise<IActivityResponse[]> {
  try {
    const activities = await activityRepository.getAll();
    return activities;
  } catch (error) {
    throw handleError(error, 'Erro ao buscar atividades');
  }
}