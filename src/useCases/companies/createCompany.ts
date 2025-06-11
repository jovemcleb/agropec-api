import { ICompany } from "../../interfaces/company";
import { CompanyRepository } from "../../repositories/CompanyRepository";
import { randomUUID } from 'crypto';

type CreateCompanyPayload = Omit<ICompany, "uuid">;

export async function createCompany(
  company: CreateCompanyPayload,
  companyRepository: CompanyRepository
) {
  const { name, description } = company;

  const companyExists = await companyRepository.findByName(name);

  if (companyExists) {
    throw new Error("Company already exists");
  }

  const companyPayload: ICompany = {
    uuid: randomUUID(),
    name,
    description,
  };

  const createdCompany = await companyRepository.create(companyPayload);

  return createdCompany;
}
