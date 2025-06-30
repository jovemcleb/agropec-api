import { randomUUID } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  IUpdateHighlight,
  ICreateHighlightRequest,
} from "../interfaces/highlight";
import { HighlightRepository } from "../repositories/HighlightRepository";
import { createHighlight } from "../useCases/highlights/createHighlight";
import { deleteHighlight } from "../useCases/highlights/deleteHighlight";
import { getAllHighlights } from "../useCases/highlights/getAllHighlights";
import { getHighlightByUuid } from "../useCases/highlights/getHighlightByUuid";
import { getHighlightsByType } from "../useCases/highlights/getHighlightsByType";
import { getHighlightsWithDetails } from "../useCases/highlights/getHighlightsWithDetails";
import { updateHighlight } from "../useCases/highlights/updateHighlight";

export class HighlightController {
  constructor(private highlightRepository: HighlightRepository) {}

  async getAllHighlights(request: FastifyRequest, reply: FastifyReply) {
    try {
      const highlights = await getAllHighlights(this.highlightRepository);

      reply.status(200).send({
        success: true,
        message: "Destaques encontrados",
        data: highlights,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async getHighlightByUuid(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const highlight = await getHighlightByUuid(uuid, this.highlightRepository);

      if (!highlight) {
        reply.status(404).send({
          success: false,
          message: "Destaque não encontrado",
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Destaque encontrado",
        data: highlight,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async getHighlightsByType(
    request: FastifyRequest<{ Params: { type: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { type } = request.params;
      
      if (!["activity", "stand"].includes(type)) {
        reply.status(400).send({
          success: false,
          message: "Tipo deve ser 'activity' ou 'stand'",
        });
        return;
      }

      const highlights = await getHighlightsByType(
        type as "activity" | "stand",
        this.highlightRepository
      );

      reply.status(200).send({
        success: true,
        message: "Destaques encontrados",
        data: highlights,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async createHighlight(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Gerar UUID para o destaque
      const highlightUuid = randomUUID();

      let highlightData: ICreateHighlightRequest;

      // Verificar se é um request multipart ou JSON
      if (request.isMultipart()) {
        // Para multipart, extrair campos do formulário
        const parts = request.parts();
        const fields: Record<string, any> = {};

        for await (const part of parts) {
          if (part.type === "field") {
            fields[part.fieldname] = part.value;
          }
        }

        highlightData = fields as ICreateHighlightRequest;
      } else {
        // Se é JSON, usar diretamente o request.body
        highlightData = request.body as ICreateHighlightRequest;
      }

      const highlight = await createHighlight(
        highlightData,
        this.highlightRepository,
        highlightUuid
      );

      reply.status(201).send({
        success: true,
        message: "Destaque criado com sucesso",
        data: highlight,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async updateHighlight(
    request: FastifyRequest<{
      Body: IUpdateHighlight;
      Params: { uuid: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const updateData = request.body;

      const highlight = await updateHighlight(
        uuid,
        updateData,
        this.highlightRepository
      );

      if (!highlight) {
        reply.status(404).send({
          success: false,
          message: "Destaque não encontrado",
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Destaque atualizado com sucesso",
        data: highlight,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async deleteHighlight(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const deleted = await deleteHighlight(uuid, this.highlightRepository);

      if (!deleted) {
        reply.status(404).send({
          success: false,
          message: "Destaque não encontrado",
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Destaque deletado com sucesso",
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async getHighlightsWithDetails(request: FastifyRequest, reply: FastifyReply) {
    try {
      const highlights = await getHighlightsWithDetails(
        this.highlightRepository,
        request.server.repositories.activity,
        request.server.repositories.stand
      );

      reply.status(200).send({
        success: true,
        message: "Destaques com detalhes encontrados",
        data: highlights,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
} 