import { IHighlightRepository } from "../../repositories/HighlightRepository";
import { handleError } from "../../utils/formatter-activity"; 

export async function deleteHighlight(
  uuid: string,
  highlightRepository: IHighlightRepository
): Promise<boolean> {
  try {
   
    if (!uuid || uuid.trim() === '') {
      throw new Error('UUID é obrigatório');
    }

   
    const existingHighlight = await highlightRepository.getByUuid(uuid);
    if (!existingHighlight) {
      throw new Error('Destaque não encontrado');
    }

    return await highlightRepository.delete(uuid);
  } catch (error) {
    
    throw handleError(error, 'Erro ao deletar destaque');
  }
}