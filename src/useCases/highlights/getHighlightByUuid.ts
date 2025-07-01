import { IHighlightResponse } from "../../interfaces/highlight";
import { IHighlightRepository } from "../../repositories/HighlightRepository";

export async function getHighlightByUuid(
  uuid: string,
  highlightRepository: IHighlightRepository
): Promise<IHighlightResponse | null> {
  try {
    const result = await highlightRepository.getByUuid(uuid);
    if (!result) return null;

    return {
      _id: result._id.toString(),
      uuid: result.uuid,
      type: result.type,
      referenceId: result.referenceId,
    };
  } catch (error) {
    throw new Error(
      `Erro ao buscar destaque: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}
