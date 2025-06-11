import { CompanyRepository } from "../../repositories/CompanyRepository";

export async function deleteCompany(
  uuid: string,
  companyRepository: CompanyRepository
) {
  const companyExists = await companyRepository.findByUuid(uuid);

  if (!companyExists) {
    throw new Error("Company not found");
  }

  await companyRepository.delete(uuid);

  return { message: "Company deleted successfully" };
}
