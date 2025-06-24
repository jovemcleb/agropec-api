import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CompanyController } from "../controllers/CompanyController";
import {
  CreateCompanySchema,
  ICreateCompany,
  IUpdateCompany,
  UpdateCompanySchema,
} from "../interfaces/company";

export const companiesRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const companyController = new CompanyController(fastify.repositories.company);

  fastify.post<{ Body: ICreateCompany }>(
    "/companies",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("admin"),
        fastify.validateSchema({
          body: CreateCompanySchema,
        }),
      ],
    },
    companyController.create.bind(companyController)
  );

  fastify.get("/companies", companyController.findAll.bind(companyController));
  fastify.put<{ Body: IUpdateCompany; Params: { uuid: string } }>(
    "/companies/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("admin"),
        fastify.validateSchema({ body: UpdateCompanySchema }),
      ],
    },
    companyController.update.bind(companyController)
  );
  fastify.delete<{ Params: { uuid: string } }>(
    "/companies/:uuid",
    {
      preHandler: [fastify.authenticate, fastify.authorize("admin")],
    },
    companyController.delete.bind(companyController)
  );
};
