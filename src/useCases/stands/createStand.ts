import { ICreateStand, IStandResponse } from "../../interfaces/stand";
import { StandRepository } from "../../repositories/StandRepository";
import { handleError } from "../../utils/formatter-activity";

export async function createStand(
  standData: ICreateStand,
  standRepository: StandRepository,
  uuid?: string
): Promise<IStandResponse> {
  try {
    return await standRepository.create(standData, uuid);
  } catch (error) {
    throw handleError(error, "Erro ao criar stand");
  }
}
