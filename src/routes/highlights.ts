import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { HighlightController } from "../controllers/HighlightController";
import {
  IUpdateHighlight,
  ICreateHighlightRequest,
  CreateHighlightRequestSchema,
  UpdateHighlightSchema,
} from "../interfaces/highlight";

export const highlightRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  const highlightController = new HighlightController(
    fastify.repositories.highlight
  );

  fastify.get(
    "/highlights",
    highlightController.getAllHighlights.bind(highlightController)
  );

  fastify.get(
    "/highlights/uuid/:uuid",
    highlightController.getHighlightByUuid.bind(highlightController)
  );

  fastify.get(
    "/highlights/type/:type",
    highlightController.getHighlightsByType.bind(highlightController)
  );

  fastify.get(
    "/highlights/with-details",
    highlightController.getHighlightsWithDetails.bind(highlightController)
  );

  fastify.post<{ Body: ICreateHighlightRequest }>("/highlights", {
    preHandler: [fastify.authenticate, fastify.authorize("anyAdmin")],
    handler: highlightController.createHighlight.bind(highlightController),
  });

  fastify.put<{
    Body: IUpdateHighlight;
    Params: { uuid: string };
  }>(
    "/highlights/:uuid",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize("anyAdmin"),
        fastify.validateSchema({ body: UpdateHighlightSchema }),
      ],
    },
    highlightController.updateHighlight.bind(highlightController)
  );

  fastify.delete<{ Params: { uuid: string } }>(
    "/highlights/:uuid",
    {
      preHandler: [fastify.authenticate, fastify.authorize("anyAdmin")],
    },
    highlightController.deleteHighlight.bind(highlightController)
  );
}; 