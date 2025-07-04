import { IUpdateCompany } from "../../interfaces/company";
import { CompanyRepository } from "../../repositories/CompanyRepository";
import { handleError } from "../../utils/formatter-activity";

export async function updateCompany(
  uuid: string,
  updateData: IUpdateCompany,
  companyRepository: CompanyRepository
) {
  try {
    return await companyRepository.update(uuid, updateData);
  } catch (error) {
    throw handleError(error, "Erro ao atualizar atividade");
  }
}
