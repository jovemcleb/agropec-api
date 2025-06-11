import { IStandResponse } from "../../interfaces/stand";
import { StandRepository } from "../../repositories/StandRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getStandByUuid(
  uuid: string,
  standRepository: StandRepository
): Promise<IStandResponse | null> {
  try {
    if (!uuid || uuid.trim() === '') {
      throw new Error('UUID é obrigatório para busca');
    }

    const stand = await standRepository.getByUuid(uuid);
    return stand;
  } catch (error) {
    throw handleError(error, 'Erro ao buscar stand por UUID');
  }
}