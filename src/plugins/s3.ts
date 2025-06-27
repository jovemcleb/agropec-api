import multipart from "@fastify/multipart";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { S3Service } from "../services/S3Service";

const s3Plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Registrar o plugin multipart
  await fastify.register(multipart, {
    limits: {
      fieldSize: 20 * 1024 * 1024, // 20MB
    },
  });

  // Criar e registrar o serviço S3
  const s3Service = new S3Service();
  fastify.decorate("s3", s3Service);
};

export const s3 = fp(s3Plugin, {
  name: "s3-plugin",
});
