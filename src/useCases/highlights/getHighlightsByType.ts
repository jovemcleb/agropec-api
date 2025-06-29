import { IHighlightResponse } from "../../interfaces/highlight";
import { IHighlightRepository } from "../../repositories/HighlightRepository";
import { handleError } from "../../utils/formatter-activity";

export async function getHighlightsByType(
  type: "activity" | "stand",
  highlightRepository: IHighlightRepository
): Promise<IHighlightResponse[]> {
  try {
    return await highlightRepository.getByType(type);
  } catch (error) {
    throw handleError(error, "Erro ao buscar destaques por tipo");
  }
} 