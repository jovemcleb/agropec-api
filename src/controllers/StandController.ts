import { FastifyReply, FastifyRequest } from "fastify";
import { getAllStands } from "../useCases/stands/getAllStands";
import { StandRepository } from "../repositories/StandRepository";
import { createStand } from "../useCases/stands/createStand";
import { ICreateStand, IUpdateStand } from "../interfaces/stand";
import { getStandsByCategory } from "../useCases/stands/getStandsByCategory";
import { getStandByName } from "../useCases/stands/getStandByName";
import { getStandByUuid } from "../useCases/stands/getStandByUuid";
import { getStandsByDate } from "../useCases/stands/getStandsByDate";
import { getStandsByInterest } from "../useCases/stands/getStandsByInterest";
import { deleteStand } from "../useCases/stands/deleteStand";
import { updateStand } from "../useCases/stands/updateStand";

export class StandController {
  private standRepository: StandRepository;

  constructor(standRepository: StandRepository) {
    this.standRepository = standRepository;
  }

  async getAllStands(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stands = await getAllStands(this.standRepository);

      reply.status(200).send({
        success: true,
        message: "Atividades encontradas",
        data: stands,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async getStandsByCategory(
    request: FastifyRequest<{ Params: { category: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { category } = request.params;

      if (!category || category.trim() === "") {
        reply.status(400).send({
          success: false,
          message: 'Parâmetro "category" é obrigatório',
        });
        return;
      }

      const stands = await getStandsByCategory(category, this.standRepository);

      reply.status(200).send({
        success: true,
        message: "Stands encontrados por categoria",
        data: stands,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async getStandByName(
    request: FastifyRequest<{ Params: { name: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { name } = request.params;

      if (!name || name.trim() === "") {
        reply.status(400).send({
          success: false,
          message: 'Parâmetro "name" é obrigatório',
        });
        return;
      }

      const stand = await getStandByName(name, this.standRepository);

      if (!stand) {
        reply.status(404).send({
          success: false,
          message: `Stand não encontrado com nome: ${name}`,
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Stand encontrado",
        data: stand,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async getStandByUuid(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;

      if (!uuid || uuid.trim() === "") {
        reply.status(400).send({
          success: false,
          message: 'Parâmetro "uuid" é obrigatório',
        });
        return;
      }

      const stand = await getStandByUuid(uuid, this.standRepository);

      if (!stand) {
        reply.status(404).send({
          success: false,
          message: `Stand não encontrado com UUID: ${uuid}`,
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Stand encontrado",
        data: stand,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async getStandsByDate(
    request: FastifyRequest<{ Params: { date: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { date } = request.params;
      const stands = await getStandsByDate(date, this.standRepository);

      reply.status(200).send({
        success: true,
        message: "Stands encontrados por data",
        data: stands,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
  async getStandsByInterest(
    request: FastifyRequest<{ Params: { interest: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { interest } = request.params;

      if (!interest || interest.trim() === "") {
        reply.status(400).send({
          success: false,
          message: 'Parâmetro "interest" é obrigatório',
        });
        return;
      }

      const stands = await getStandsByInterest(interest, this.standRepository);

      reply.status(200).send({
        success: true,
        message: "Stands encontrados por interesse",
        data: stands,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
  async createStand(
    request: FastifyRequest<{ Body: ICreateStand }>,
    reply: FastifyReply
  ) {
    try {
      const standData = request.body;
      const stand = await createStand(standData, this.standRepository);

      reply.status(201).send({
        success: true,
        message: "Stand criado com sucesso",
        data: stand,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }
  async updateStand(
    request: FastifyRequest<{ Body: IUpdateStand; Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;
      const standData = request.body;

      const updatedStand = await updateStand(
        uuid,
        standData,
        this.standRepository
      );

      if (!updatedStand) {
        reply.status(404).send({
          success: false,
          message: `Stand não encontrado com UUID: ${uuid}`,
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Stand atualizado com sucesso",
        data: updatedStand,
      });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async deleteStand(
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;

      const deleted = await deleteStand(uuid, this.standRepository);

      if (!deleted) {
        reply.status(404).send({
          success: false,
          message: `Stand não encontrado com UUID: ${uuid}`,
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: "Stand deletado com sucesso",
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
