import { randomUUID } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateStandSchema,
  IUpdateStand,
  IUpdateStandImages,
} from "../interfaces/stand";
import { StandRepository } from "../repositories/StandRepository";
import { ImageUploadService } from "../services/ImageUploadService";
import { createStand } from "../useCases/stands/createStand";
import { deleteStand } from "../useCases/stands/deleteStand";
import { getAllStands } from "../useCases/stands/getAllStands";
import { getStandByName } from "../useCases/stands/getStandByName";
import { getStandByUuid } from "../useCases/stands/getStandByUuid";
import { getStandsByCategory } from "../useCases/stands/getStandsByCategory";
import { getStandsByDate } from "../useCases/stands/getStandsByDate";
import { getStandsByInterest } from "../useCases/stands/getStandsByInterest";
import { updateStand } from "../useCases/stands/updateStand";

export class StandController {
  constructor(
    private standRepository: StandRepository,
    private imageUploadService: ImageUploadService
  ) {}

  async getAllStands(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stands = await getAllStands(this.standRepository);

      reply.status(200).send({
        success: true,
        message: "Stands encontrados",
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

  async createStand(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Gerar UUID antes do upload
      const standUuid = randomUUID();

      // Processar imagem e dados do stand, passando o UUID
      const standData = await this.imageUploadService.handleStandCreation(
        request,
        standUuid
      );

      // Validar dados
      const validatedData = CreateStandSchema.parse(standData);

      // Criar stand com o UUID gerado
      const stand = await createStand(
        validatedData,
        this.standRepository,
        standUuid
      );

      reply.status(201).send({
        success: true,
        message: "Stand criado com sucesso",
        data: stand,
      });
    } catch (error) {
      console.error("Erro ao criar stand:", error);
      if (error instanceof Error) {
        reply.status(500).send({
          success: false,
          message: "Erro ao criar stand",
          error: error.message,
        });
      } else {
        reply.status(500).send({
          success: false,
          message: "Erro interno ao criar stand",
        });
      }
    }
  }

  async updateStand(
    request: FastifyRequest<{ Body: IUpdateStand; Params: { uuid: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;

      // Buscar stand atual para verificar imagens existentes
      const currentStand = await this.standRepository.getByUuid(uuid);
      if (!currentStand) {
        reply.status(404).send({
          success: false,
          message: `Stand não encontrado com UUID: ${uuid}`,
        });
        return;
      }

      // Processar novas imagens se fornecidas, passando o UUID do stand
      const standData = await this.imageUploadService.handleStandUpdate(
        request,
        currentStand.imageUrls,
        uuid
      );

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

      // Buscar stand para obter URLs das imagens
      const stand = await this.standRepository.getByUuid(uuid);
      if (!stand) {
        reply.status(404).send({
          success: false,
          message: `Stand não encontrado com UUID: ${uuid}`,
        });
        return;
      }

      // Deletar as imagens do S3 se existirem
      if (stand.imageUrls && stand.imageUrls.length > 0) {
        await this.imageUploadService.deleteImages(stand.imageUrls);
      }

      // Deletar o stand do banco de dados
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

  async updateStandImage(
    request: FastifyRequest<{
      Params: { uuid: string };
      Body: IUpdateStandImages;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { uuid } = request.params;

      // Buscar stand atual para verificar imagens existentes
      const currentStand = await this.standRepository.getByUuid(uuid);
      if (!currentStand) {
        reply.status(404).send({
          success: false,
          message: `Stand não encontrado com UUID: ${uuid}`,
        });
        return;
      }

      // Extrair imageIds do multipart/form-data se for multipart
      let newImageIds: string[] | undefined;

      if (request.isMultipart()) {
        // Para multipart, vamos extrair os IDs antes de passar para handleStandUpdate
        // Primeiro vamos precisar de uma forma de extrair apenas os campos sem consumir o stream
        // Por enquanto, vamos deixar handleStandUpdate lidar com tudo
        newImageIds = undefined; // Será extraído dentro do handleStandUpdate
      } else {
        // Se não é multipart, usar request.body
        newImageIds = request.body?.imageIds;
      }

      // Se não é multipart e não foram fornecidos IDs, retornar erro
      if (
        !request.isMultipart() &&
        (!newImageIds || newImageIds.length === 0)
      ) {
        reply.status(400).send({
          success: false,
          message: "Nenhuma imagem fornecida para atualização",
        });
        return;
      }

      // Processar novas imagens se fornecidas, passando o UUID do stand e IDs das imagens
      const uploadResult = await this.imageUploadService.handleStandUpdate(
        request,
        currentStand.imageUrls || [],
        uuid,
        newImageIds
      );

      // Atualizar apenas as imageUrls do stand
      const updatedStand = await updateStand(
        uuid,
        { imageUrls: uploadResult.imageUrls },
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
        message: "Imagens do stand atualizadas com sucesso",
        data: updatedStand,
      });
    } catch (error) {
      console.error("Erro ao atualizar imagens do stand:", error);
      if (error instanceof Error) {
        reply.status(500).send({
          success: false,
          message: "Erro ao atualizar imagens do stand",
          error: error.message,
        });
      } else {
        reply.status(500).send({
          success: false,
          message: "Erro interno ao atualizar imagens do stand",
        });
      }
    }
  }
}
