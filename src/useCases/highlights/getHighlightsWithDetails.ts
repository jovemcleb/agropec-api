import { IHighlightWithDetails } from "../../interfaces/highlight";
import { IActivityRepository } from "../../repositories/ActivityRepository";
import { IHighlightRepository } from "../../repositories/HighlightRepository";
import { StandRepository } from "../../repositories/StandRepository";
import { handleError } from "../../utils/formatter-activity";

// As tipagens que você quer usar são importadas aqui
import { IActivityWithCompanyResponse } from "../../interfaces/activity";
import { IStandWithCompanyResponse } from "../../interfaces/stand";

export async function getHighlightsWithDetails(
  highlightRepository: IHighlightRepository,
  activityRepository: IActivityRepository,
  standRepository: StandRepository
): Promise<IHighlightWithDetails[]> {
  try {
    const highlights = await highlightRepository.getAll();

    if (!highlights || highlights.length === 0) {
      return [];
    }

    const activityIds: string[] = [];
    const standIds: string[] = [];

    highlights.forEach((highlight) => {
      if (highlight.type === "activity") {
        activityIds.push(highlight.referenceId);
      } else if (highlight.type === "stand") {
        standIds.push(highlight.referenceId);
      }
    });

    const [activities, stands] = await Promise.all([
      activityIds.length > 0
        ? Promise.all(
            activityIds.map(async (id) => {
              try {
                const activity = await activityRepository.getByUuidWithCompany(
                  id
                );
                return activity;
              } catch (error) {
                return null;
              }
            })
          )
        : Promise.resolve([]),
      standIds.length > 0
        ? Promise.all(
            standIds.map(async (id) => {
              try {
                const stand = await standRepository.getByUuidWithCompany(id);
                return stand;
              } catch (error) {
                return null;
              }
            })
          )
        : Promise.resolve([]),
    ]);

    const activityMap = new Map<string, IActivityWithCompanyResponse>();
    activities
      .filter(
        (activity): activity is IActivityWithCompanyResponse =>
          activity !== null
      )
      .forEach((activity) => activityMap.set(activity.uuid, activity));

    const standMap = new Map<string, IStandWithCompanyResponse>();
    stands
      .filter((stand): stand is IStandWithCompanyResponse => stand !== null)
      .forEach((stand) => standMap.set(stand.uuid, stand));

    const highlightsWithDetails = highlights.map((highlight) => {
      const result = {
        ...highlight,
        activity:
          highlight.type === "activity"
            ? activityMap.get(highlight.referenceId)
            : undefined,
        stand:
          highlight.type === "stand"
            ? standMap.get(highlight.referenceId)
            : undefined,
      };
      return result;
    });

    return highlightsWithDetails;
  } catch (error) {
    throw handleError(error, "Erro ao buscar destaques com detalhes");
  }
}
