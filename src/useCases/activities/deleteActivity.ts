import { IActivityRepository } from "../../repositories/ActivityRepository";
import { handleError } from "../../utils/formatter-activity";

export async function deleteActivity(
    uuid: string,
    activityRepository: IActivityRepository
): Promise<boolean> {
    try {
      if (!uuid || uuid.trim() === '') {
        throw new Error('UUID é obrigatório');
      }

      const existingActivity = await activityRepository.getByUuid(uuid);
      if (!existingActivity) {
        throw new Error('Atividade não encontrada');
      }

      return await activityRepository.delete(uuid);
    } catch (error) {
      throw handleError(error, 'Erro ao deletar atividade');
    }
  }
