import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { StandController } from "../controllers/StandController";
import {
  CreateStandSchema,
  ICreateStand,
  IUpdateStand,
  UpdateStandSchema,
} from "../interfaces/stand";

export const standRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  if (!fastify.repositories || !fastify.repositories.stand) {
    fastify.log.error("Stand repository not found on fastify instance.");
    throw new Error("Stand repository is not available.");
  }

  const standController = new StandController(fastify.repositories.stand);

  fastify.get("/stands", standController.getAllStands.bind(standController));
  fastify.get(
    "/stands/category/:category",
    standController.getStandsByCategory.bind(standController)
  );
  fastify.get(
    "/stands/name/:name",
    standController.getStandByName.bind(standController)
  );
  fastify.get(
    "/stands/uuid/:uuid",
    standController.getStandByUuid.bind(standController)
  );
  fastify.get(
    "/stands/date/:date",
    standController.getStandsByDate.bind(standController)
  );
  fastify.get(
    "/stands/interest/:interest",
    standController.getStandsByInterest.bind(standController)
  );
  fastify.post<{ Body: ICreateStand }>(
    "/stands",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("anyAdmin"),
        fastify.validateSchema({ body: CreateStandSchema }),
      ],
    },
    standController.createStand.bind(standController)
  );

  fastify.put<{ Body: IUpdateStand; Params: { uuid: string } }>(
    "/stands/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("anyAdmin"),
        fastify.validateSchema({ body: UpdateStandSchema }),
      ],
    },
    standController.updateStand.bind(standController)
  );
  fastify.delete<{ Params: { uuid: string } }>(
    "/stands/:uuid",
    {
      preHandler: [fastify.authenticate, fastify.authorize("anyAdmin")],
    },
    standController.deleteStand.bind(standController)
  );
};
