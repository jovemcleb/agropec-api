import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ImageUploadService } from "../services/ImageUploadService";
import { clearImageHashCache } from "../utils/upload";

const imageUploadPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  if (!fastify.s3) {
    throw new Error(
      "S3Service não está disponível. Certifique-se de registrar o plugin s3 primeiro."
    );
  }

  const imageUploadService = new ImageUploadService(fastify.s3);
  fastify.decorate("imageUpload", imageUploadService);

  // Limpar cache de hashes a cada 24 horas
  setInterval(() => {
    clearImageHashCache();
    console.log("🧹 Cache de hashes de imagens limpo automaticamente");
  }, 24 * 60 * 60 * 1000); // 24 horas em millisegundos
};

export const imageUpload = fp(imageUploadPlugin, {
  name: "image-upload-plugin",
  dependencies: ["s3-plugin"],
});
