import { CreateStandSchema, ICreateStand, IStandResponse } from "../../interfaces/stand";
import { StandRepository } from "../../repositories/StandRepository";
import {  handleError } from "../../utils/formatter-activity";

export async function createStand(
    standData: ICreateStand,
    standRepository: StandRepository):
 Promise<IStandResponse> {
  try {
   return await standRepository.create(standData); 
  } catch (error) {
    throw handleError(error, 'Erro ao criar stand');
  }
}