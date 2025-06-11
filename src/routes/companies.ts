import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CompanyController } from "../controllers/CompanyController";
import {
  CreateCompanySchema,
  IUpdateCompany,
  UpdateCompanySchema,
} from "../interfaces/company";
import { z } from "zod";

type UpdateCompanyBody = z.infer<typeof UpdateCompanySchema>;

export const companiesRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const companyController = new CompanyController(fastify.repositories.company);

  fastify.post(
    "/companies",
    {
      preHandler: fastify.validateSchema({
        body: CreateCompanySchema,
      }),
    },
    companyController.create.bind(companyController)
  );
  fastify.get("/companies", companyController.findAll.bind(companyController));
  fastify.put<{ Body: IUpdateCompany;
     Params: { uuid: string } 
  }>(
    "/companies/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.validateSchema({ body: UpdateCompanySchema }),
      ],
    },
    companyController.update.bind(companyController)
  );
  fastify.delete(
    "/companies/:uuid",
    companyController.delete.bind(companyController)
  );
};
