import { StandRepository } from "../../repositories/StandRepository";
import { handleError } from "../../utils/formatter-activity";

export async function deleteStand(
  uuid: string,
  standRepository: StandRepository
): Promise<boolean> {
  try {
    if (!uuid || uuid.trim() === '') {
      throw new Error('UUID é obrigatório para exclusão');
    }

    const deleted = await standRepository.delete(uuid);
    return deleted;
  } catch (error) {
    throw handleError(error, 'Erro ao deletar stand');
  }
}