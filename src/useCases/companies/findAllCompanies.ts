import { CompanyRepository } from "../../repositories/CompanyRepository";

export async function findAllCompanies(companyRepository: CompanyRepository) {
  const companies = await companyRepository.findAll();

  if (!companies) {
    throw new Error("No companies found");
  }

  return companies;
}
