import { FastifyReply, FastifyRequest } from "fastify";
import { ICreateCompany, IUpdateCompany } from "../interfaces/company";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { createCompany } from "../useCases/companies/createCompany";
import { deleteCompany } from "../useCases/companies/deleteCompany";
import { findAllCompanies } from "../useCases/companies/findAllCompanies";
import { updateCompany } from "../useCases/companies/updateCompany";


export class CompanyController {
  private companyRepository: CompanyRepository
  constructor(companyRepository: CompanyRepository) {
    this.companyRepository = companyRepository;
  }

  async create(
    request: FastifyRequest<{ Body: ICreateCompany }>,
    reply: FastifyReply
  ) {
    try {
      const { name, description } = request.body;

      const company = await createCompany(
        { name, description },
        this.companyRepository
      );

      reply.status(201).send(company);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const companies = await findAllCompanies(this.companyRepository);

      reply.status(200).send(companies);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async update(
    request: FastifyRequest<{
      Body: IUpdateCompany;
      Params: { uuid: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const { name, description } = request.body;

      const updateData = {
        uuid,
        name,
        description, 
      };

      const updatedCompany = (await updateCompany(
        uuid,
        updateData,
        this.companyRepository 
      ));

      reply.status(200).send(updatedCompany);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;

      const deletedCompany = await deleteCompany(uuid, this.companyRepository);

      reply.status(200).send(deletedCompany);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(400).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
}
