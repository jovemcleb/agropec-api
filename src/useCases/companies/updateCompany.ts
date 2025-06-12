import { ICompany, IUpdateCompany } from "../../interfaces/company";
import { CompanyRepository } from "../../repositories/CompanyRepository";
interface UpdateCompanyPayload extends IUpdateCompany {
  uuid: string;
}

export async function updateCompany(
  payload: UpdateCompanyPayload,
  companyRepository: CompanyRepository
) {
  const { uuid, name, description } = payload;

  const companyExists = await companyRepository.findByUuid(uuid);

  if (!companyExists) {
    throw new Error("Company not found");
  }

  const updateData = {
    name,
    description,
    updatedAt: new Date(),
  };

  const updatedCompany = await companyRepository.update(uuid, updateData);

  if (!updatedCompany) {
    throw new Error("Failed to update company");
  }
  return updatedCompany;
}
