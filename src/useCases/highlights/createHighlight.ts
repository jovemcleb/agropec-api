import { IHighlightResponse, ICreateHighlight } from "../../interfaces/highlight";
import { IHighlightRepository } from "../../repositories/HighlightRepository";
import { handleError } from "../../utils/formatter-activity";

export async function createHighlight(
  highlightData: ICreateHighlight,
  highlightRepository: IHighlightRepository,
  uuid?: string
): Promise<IHighlightResponse> {
  try {
    return await highlightRepository.create(highlightData, uuid);
  } catch (error) {
    throw handleError(error, "Erro ao criar destaque");
  }
} 