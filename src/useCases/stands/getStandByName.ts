import { IStandResponse } from "../../interfaces/stand";
import { StandRepository } from "../../repositories/StandRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getStandByName(
  name: string,
  standRepository: StandRepository
): Promise<IStandResponse | null> {
  try {
    if (!name || name.trim() === '') {
      throw new Error('Nome é obrigatório para busca');
    }

    const stand = await standRepository.getByName(name);
    return stand;
  } catch (error) {
    throw handleError(error, 'Erro ao buscar stand por nome');
  }
}
