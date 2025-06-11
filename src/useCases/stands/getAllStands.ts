import { IStandResponse } from "../../interfaces/stand";
import { StandRepository } from "../../repositories/StandRepository";
import {  handleError } from "../../utils/formatter-activity";

export async function getAllStands(standRepository: StandRepository):
 Promise<IStandResponse[]> {
  try {
   return await standRepository.getAll();
  } catch (error) {
    throw handleError(error, 'Erro ao buscar atividades');
  }
}