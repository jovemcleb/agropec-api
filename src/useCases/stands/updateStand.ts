import {
  IStandResponse,
  IUpdateStand,
  UpdateStandSchema,
} from "../../interfaces/stand";
import { StandRepository } from "../../repositories/StandRepository";
import { handleError } from "../../utils/formatter-activity";

export async function updateStand(
  uuid: string,
  standData: IUpdateStand,
  standRepository: StandRepository
): Promise<IStandResponse | null> {
  try {
    if (!uuid || uuid.trim() === "") {
      throw new Error("UUID é obrigatório para atualização");
    }

    return await standRepository.update(uuid, standData);
  } catch (error) {
    throw handleError(error, "Erro ao atualizar stand");
  }
}
