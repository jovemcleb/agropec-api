import { IHighlightWithDetails } from "../../interfaces/highlight";
import { IHighlightRepository } from "../../repositories/HighlightRepository";
import { IActivityRepository } from "../../repositories/ActivityRepository";
import { StandRepository } from "../../repositories/StandRepository";
import { handleError } from "../../utils/formatter-activity";
import { IActivityResponse } from "../../interfaces/activity";
import { IStandResponse } from "../../interfaces/stand"; 

export async function getHighlightsWithDetails(
  highlightRepository: IHighlightRepository,
  activityRepository: IActivityRepository,
  standRepository: StandRepository
): Promise<IHighlightWithDetails[]> {
  try {
    // 1. Busca inicial dos destaques
    const highlights = await highlightRepository.getAll();
    if (highlights.length === 0) {
      return [];
    }

    // 2. Separa os IDs de referência por tipo para buscar em lote
    const activityIds: string[] = [];
    const standIds: string[] = [];

    highlights.forEach((highlight) => {
      if (highlight.type === "activity") {
        activityIds.push(highlight.referenceId);
      } else if (highlight.type === "stand") {
        standIds.push(highlight.referenceId);
      }
    });

    // 3. Busca todos os dados relacionados de uma só vez, em paralelo
    const [activities, stands] = await Promise.all([
      activityIds.length > 0 ? activityRepository.getManyByUuids(activityIds) : Promise.resolve([]),
      standIds.length > 0 ? standRepository.getManyByUuids(standIds) : Promise.resolve([]),
    ]);

    // 4. Organiza os dados em um Map para busca rápida
    const activityMap = new Map<string, IActivityResponse>(
      activities.map((activity) => [activity.uuid, activity])
    );
    const standMap = new Map<string, IStandResponse>(
      stands.map((stand) => [stand.uuid, stand])
    );

    // 5. Monta a resposta final, combinando os dados de forma eficiente
    const highlightsWithDetails = highlights.map((highlight) => {
      return {
        ...highlight,
        activity: highlight.type === 'activity' ? activityMap.get(highlight.referenceId) : undefined,
        stand: highlight.type === 'stand' ? standMap.get(highlight.referenceId) : undefined,
      };
    });

    return highlightsWithDetails;
  } catch (error) {
    throw handleError(error, 'Erro ao buscar destaques com detalhes');
  }
}