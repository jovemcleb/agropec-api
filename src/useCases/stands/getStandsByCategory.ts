import { IStandResponse } from "../../interfaces/stand";
import { StandRepository } from "../../repositories/StandRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getStandsByCategory(
  category: string,
  standRepository: StandRepository
): Promise<IStandResponse[]> {
  try {
    if (!category || category.trim() === '') {
      throw new Error('Categoria é obrigatória para busca');
    }

    const stands = await standRepository.getByCategory(category);
    return stands;
  } catch (error) {
    throw handleError(error, 'Erro ao buscar stands por categoria');
  }
}
