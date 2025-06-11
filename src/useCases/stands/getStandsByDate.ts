import { IStandResponse } from "../../interfaces/stand";
import { StandRepository } from "../../repositories/StandRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getStandsByDate(
  date: string,
  standRepository: StandRepository
): Promise<IStandResponse[]> {
  try {
    if (!date || isNaN(Date.parse(date))) {
        throw new Error('Data inválida');
      }
    const stands = await standRepository.getByDate(date);
    return stands;
  } catch (error) {
    throw handleError(error, 'Erro ao buscar stands por data');
  }
}