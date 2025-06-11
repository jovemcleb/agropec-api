import { IActivityResponse } from "../../interfaces/activity";
import { IActivityRepository } from "../../repositories/ActivityRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getActivityByUuid(
    uuid: string,
    activityRepository: IActivityRepository
): Promise<IActivityResponse | null> {
    try {
      if (!uuid || uuid.trim() === '') {
        throw new Error('UUID é obrigatório');
      }

      const activity = await activityRepository.getByUuid(uuid);
      return activity;
    } catch (error) {
      throw handleError(error, 'Erro ao buscar atividade por UUID');
    }
  }
