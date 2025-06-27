import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { StandController } from "../controllers/StandController";
import {
  ICreateStandRequest,
  IUpdateStand,
  IUpdateStandImages,
  UpdateStandSchema,
} from "../interfaces/stand";

export const standRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  if (!fastify.repositories || !fastify.repositories.stand) {
    fastify.log.error("Stand repository not found on fastify instance.");
    throw new Error("Stand repository is not available.");
  }

  const standController = new StandController(
    fastify.repositories.stand,
    fastify.imageUpload
  );

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

  fastify.post<{ Body: ICreateStandRequest }>("/stands", {
    preHandler: [fastify.authenticate, fastify.authorize("anyAdmin")],
    handler: standController.createStand.bind(standController),
  });

  fastify.put<{ Body: IUpdateStand; Params: { uuid: string } }>(
    "/stands/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("anyAdmin"),
        fastify.validateSchema({ body: UpdateStandSchema }),
      ],
      onResponse: async (request, reply) => {
        const users = await fastify.repositories.user.findByStand(
          request.params.uuid
        );

        for (const user of users) {
          await fastify.notificationScheduler.scheduleUserEventNotifications(
            user.uuid
          );
        }
      },
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

  fastify.patch<{
    Params: { uuid: string };
    Body: IUpdateStandImages;
  }>(
    "/stands/:uuid/images",
    {
      preHandler: [fastify.authenticate, fastify.authorize("anyAdmin")],
    },
    standController.updateStandImage.bind(standController)
  );
};
