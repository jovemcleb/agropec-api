import { IHighlightResponse, IUpdateHighlight } from "../../interfaces/highlight";
import { IHighlightRepository } from "../../repositories/HighlightRepository";

export async function updateHighlight(
  uuid: string,
  updateData: IUpdateHighlight,
  highlightRepository: IHighlightRepository
): Promise<IHighlightResponse | null> {
  try {
    const result = await highlightRepository.update(uuid, updateData);
    if (!result) return null;
    
    return {
      _id: result._id.toString(),
      uuid: result.uuid,
      title: result.title,
      description: result.description,
      type: result.type,
      referenceId: result.referenceId,
      priority: result.priority,
      isActive: result.isActive,
      startDate: result.startDate,
      endDate: result.endDate,
      imageUrl: result.imageUrl,
    };
  } catch (error) {
    throw new Error(`Erro ao atualizar destaque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
} 