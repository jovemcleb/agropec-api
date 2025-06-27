import { IStandResponse, IUpdateStand } from "../../interfaces/stand";
import { StandRepository } from "../../repositories/StandRepository";
import { handleError } from "../../utils/formatter-activity";

export async function updateStand(
  uuid: string,
  updateData: IUpdateStand,
  standRepository: StandRepository
): Promise<IStandResponse | null> {
  try {
    return await standRepository.update(uuid, updateData);
  } catch (error) {
    throw handleError(error, "Erro ao atualizar stand");
  }
}
