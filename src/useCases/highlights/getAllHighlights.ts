import { IHighlightResponse } from "../../interfaces/highlight";
import { IHighlightRepository } from "../../repositories/HighlightRepository";

export async function getAllHighlights(
  highlightRepository: IHighlightRepository
): Promise<IHighlightResponse[]> {
  try {
    return await highlightRepository.getAll();
  } catch (error) {
    throw new Error(`Erro ao buscar destaques: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
} 