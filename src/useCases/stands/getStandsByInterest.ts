import { IStandResponse } from "../../interfaces/stand";
import { StandRepository } from "../../repositories/StandRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getStandsByInterest(
  interest: string,
  standRepository: StandRepository
): Promise<IStandResponse[]> {
  try {
    if (!interest || interest.trim() === '') {
      throw new Error('Interesse é obrigatório para busca');
    }

    const stands = await standRepository.getByInterest(interest);
    return stands;
  } catch (error) {
    throw handleError(error, 'Erro ao buscar stands por interesse');
  }
}