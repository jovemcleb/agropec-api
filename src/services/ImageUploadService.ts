import { FastifyRequest } from "fastify";
import { ICreateActivity, IUpdateActivity } from "../interfaces/activity";
import { ICreateStand, IUpdateStand } from "../interfaces/stand";
import { processUpload } from "../utils/upload";
import { S3Service } from "./S3Service";

interface ImageConfig {
  width?: number;
  height?: number;
  quality?: number;
}

export class ImageUploadService {
  private readonly standConfig: ImageConfig = {
    width: 1920,
    height: 1080,
    quality: 80,
  };

  private readonly activityConfig: ImageConfig = {
    width: 1920,
    height: 1080,
    quality: 80,
  };

  constructor(private s3Service: S3Service) {}

  // Método auxiliar para extrair ID de uma URL existente
  private extractImageIdFromUrl(url: string): string {
    const filename = url.split("/").pop() || "";
    const imageId = filename.split(".")[0]; // Remove a extensão
    return imageId;
  }

  // Método auxiliar para comparar imagens e determinar ações necessárias
  private async analyzeImageChanges(
    currentImageUrls: string[],
    newImageIds: string[],
    newImages: Array<{
      buffer: Buffer;
      filename: string;
      hash: string;
      mimetype: string;
    }>
  ): Promise<{
    imagesToKeep: string[];
    imagesToDelete: string[];
    imagesToUpload: Array<{
      buffer: Buffer;
      filename: string;
      hash: string;
      mimetype: string;
    }>;
  }> {
    const imagesToKeep: string[] = [];
    const imagesToDelete: string[] = [];
    const imagesToUpload: Array<{
      buffer: Buffer;
      filename: string;
      hash: string;
      mimetype: string;
    }> = [];

    // Mapear imagens atuais por ID
    const currentImagesMap = new Map<string, string>();
    for (const url of currentImageUrls) {
      const imageId = this.extractImageIdFromUrl(url);
      currentImagesMap.set(imageId, url);
    }

    // Mapear novas imagens por hash
    const newImagesMap = new Map<
      string,
      { buffer: Buffer; filename: string; hash: string; mimetype: string }
    >();
    for (const image of newImages) {
      newImagesMap.set(image.hash, image);
    }

    // Verificar quais imagens manter (ID existe em newImageIds)
    for (const [imageId, url] of currentImagesMap) {
      if (newImageIds.includes(imageId)) {
        imagesToKeep.push(url);
      } else {
        imagesToDelete.push(url);
      }
    }

    // As imagens em newImages são realmente novas
    imagesToUpload.push(...newImagesMap.values());

    return {
      imagesToKeep,
      imagesToDelete,
      imagesToUpload,
    };
  }

  // Método auxiliar para fazer upload de imagens
  private async uploadImages(
    images: Array<{
      buffer: Buffer;
      filename: string;
      hash: string;
      mimetype: string;
    }>,
    prefix: string,
    entityUuid?: string
  ): Promise<string[]> {
    const imageUrls: string[] = [];

    for (const image of images) {
      console.log(`      - Hash: ${image.hash}`);
      console.log(`      - Tamanho: ${image.buffer.length} bytes`);

      const s3Key = entityUuid
        ? `${prefix}/${entityUuid}/${image.filename}`
        : `${prefix}/${image.filename}`;

      try {
        const imageUrl = await this.s3Service.uploadImage(
          image.buffer,
          s3Key,
          image.mimetype
        );
        imageUrls.push(imageUrl);
        console.log(`      ✅ Upload bem-sucedido`);
      } catch (error) {
        console.warn("      ❌ Erro no upload S3, pulando imagem:", error);
      }
    }

    return imageUrls;
  }

  async handleStandCreation(
    request: FastifyRequest,
    standUuid: string
  ): Promise<ICreateStand> {
    const uploadResult = await processUpload(request, this.standConfig);
    let fields = {};
    let imageUrls: string[] = [];

    if (uploadResult) {
      console.log(
        `📸 Upload de ${uploadResult.images.length} imagem(ns) para stand ${standUuid}:`
      );

      for (const image of uploadResult.images) {
        console.log(`   - Hash: ${image.hash}`);
        console.log(`   - Tamanho: ${image.buffer.length} bytes`);
        console.log(`   - Tipo: ${image.mimetype}`);
      }

      imageUrls = await this.uploadImages(
        uploadResult.images,
        "stands",
        standUuid
      );
      fields = uploadResult.fields;
    } else {
      // Se não há upload de imagens, ainda podemos ter campos de formulário
      // mas como já chamamos processUpload acima, não podemos chamar novamente
      console.log(
        "⚠️ Nenhuma imagem detectada, processando apenas campos do formulário"
      );
      fields = {}; // Campos estarão vazios já que não houve multipart com campos
    }

    const standData: ICreateStand = {
      ...(fields as ICreateStand),
      ...(imageUrls.length > 0 && { imageUrls }),
    };

    return standData;
  }

  async handleStandUpdate(
    request: FastifyRequest,
    currentImageUrls?: string[],
    standUuid?: string,
    newImageIds?: string[]
  ): Promise<IUpdateStand> {
    console.log("🔄 [handleStandUpdate] Iniciando atualização...");
    console.log("🔄 [handleStandUpdate] Imagens atuais:", currentImageUrls);
    console.log("🔄 [handleStandUpdate] newImageIds recebido:", newImageIds);

    let imageUrls = currentImageUrls || [];
    const uploadResult = await processUpload(request, this.standConfig);
    console.log(
      "🔄 [handleStandUpdate] Resultado do processUpload:",
      uploadResult
    );
    let fields = {};

    // Se newImageIds não foi fornecido, tentar extrair dos campos do upload
    if (!newImageIds && uploadResult?.fields?.imageIds) {
      try {
        const parsedIds = JSON.parse(uploadResult.fields.imageIds);
        newImageIds = Array.isArray(parsedIds) ? parsedIds : [];
        console.log(
          "✅ [handleStandUpdate] imageIds extraídos dos campos:",
          newImageIds
        );
      } catch (error) {
        console.warn(
          "⚠️ [handleStandUpdate] Erro ao fazer parse do imageIds:",
          error
        );
        newImageIds = [];
      }
    }

    // Se newImageIds foi definido (mesmo que seja array vazio), processar a atualização
    if (newImageIds !== undefined) {
      console.log(
        `📋 [handleStandUpdate] Processando atualização com ${newImageIds.length} IDs`
      );

      if (uploadResult) {
        console.log(
          `🔄 Análise inteligente de ${uploadResult.images.length} imagem(ns) para stand ${standUuid}:`
        );

        const { imagesToKeep, imagesToDelete, imagesToUpload } =
          await this.analyzeImageChanges(
            currentImageUrls || [],
            newImageIds || [],
            uploadResult.images
          );

        console.log(`   📋 Análise concluída:`);
        console.log(`      - Manter: ${imagesToKeep.length} imagem(ns)`);
        console.log(`      - Deletar: ${imagesToDelete.length} imagem(ns)`);
        console.log(`      - Upload: ${imagesToUpload.length} imagem(ns)`);

        // Deletar apenas as imagens que não estão mais na lista
        if (imagesToDelete.length > 0) {
          console.log(
            `   🗑️ Deletando ${imagesToDelete.length} imagem(ns) removida(s):`
          );
          for (const imageUrl of imagesToDelete) {
            console.log(`      - ${imageUrl}`);
            await this.s3Service.deleteImage(imageUrl);
          }
        }

        // Fazer upload apenas das imagens realmente novas
        if (imagesToUpload.length > 0) {
          console.log(
            `   📤 Fazendo upload de ${imagesToUpload.length} nova(s) imagem(ns):`
          );
          const newImageUrls = await this.uploadImages(
            imagesToUpload,
            "stands",
            standUuid
          );
          imageUrls = [...imagesToKeep, ...newImageUrls];
        } else {
          imageUrls = imagesToKeep;
        }

        fields = uploadResult.fields;
      } else {
        console.log(
          "⚠️ [handleStandUpdate] Nenhum upload detectado, processando apenas reorganização"
        );
        // Se não há upload, manter apenas as imagens especificadas em newImageIds
        const imagesToKeep: string[] = [];
        const imagesToDelete: string[] = [];

        // Mapear imagens atuais por ID
        const currentImagesMap = new Map<string, string>();
        for (const url of currentImageUrls || []) {
          const imageId = this.extractImageIdFromUrl(url);
          currentImagesMap.set(imageId, url);
        }

        // Verificar quais imagens manter
        for (const [imageId, url] of currentImagesMap) {
          if (newImageIds.includes(imageId)) {
            imagesToKeep.push(url);
          } else {
            imagesToDelete.push(url);
          }
        }

        console.log(`📋 [handleStandUpdate] Reorganização:`);
        console.log(`   - Manter: ${imagesToKeep.length} imagem(ns)`);
        console.log(`   - Deletar: ${imagesToDelete.length} imagem(ns)`);

        // Deletar imagens removidas
        if (imagesToDelete.length > 0) {
          console.log(
            `   🗑️ Deletando ${imagesToDelete.length} imagem(ns) removida(s):`
          );
          for (const imageUrl of imagesToDelete) {
            console.log(`      - ${imageUrl}`);
            await this.s3Service.deleteImage(imageUrl);
          }
        }

        imageUrls = imagesToKeep;
      }
    } else {
      console.log(
        "⚠️ [handleStandUpdate] newImageIds não definido, mantendo imagens atuais"
      );
    }

    const standData: IUpdateStand = {
      ...(fields as IUpdateStand),
      imageUrls: imageUrls, // Sempre incluir imageUrls, mesmo que seja array vazio
    };

    console.log("✅ [handleStandUpdate] Resultado final:", {
      imageUrls: standData.imageUrls,
    });
    return standData;
  }

  async handleActivityCreation(
    request: FastifyRequest,
    activityUuid: string
  ): Promise<ICreateActivity> {
    const uploadResult = await processUpload(request, this.activityConfig);
    let fields = {};
    let imageUrls: string[] = [];

    if (uploadResult) {
      console.log(
        `📸 Upload de ${uploadResult.images.length} imagem(ns) para atividade ${activityUuid}:`
      );

      for (const image of uploadResult.images) {
        console.log(`   - Hash: ${image.hash}`);
        console.log(`   - Tamanho: ${image.buffer.length} bytes`);
        console.log(`   - Tipo: ${image.mimetype}`);
      }

      imageUrls = await this.uploadImages(
        uploadResult.images,
        "activities",
        activityUuid
      );
      fields = uploadResult.fields;
    } else {
      // Se não há upload de imagens, ainda podemos ter campos de formulário
      // mas como já chamamos processUpload acima, não podemos chamar novamente
      console.log(
        "⚠️ Nenhuma imagem detectada, processando apenas campos do formulário"
      );
      fields = {}; // Campos estarão vazios já que não houve multipart com campos
    }

    const activityData: ICreateActivity = {
      ...(fields as ICreateActivity),
      ...(imageUrls.length > 0 && { imageUrls }),
    };

    return activityData;
  }

  async handleActivityUpdate(
    request: FastifyRequest,
    currentImageUrls?: string[],
    activityUuid?: string,
    newImageIds?: string[]
  ): Promise<IUpdateActivity> {
    console.log("🔄 [handleActivityUpdate] Iniciando atualização...");
    console.log("🔄 [handleActivityUpdate] Imagens atuais:", currentImageUrls);
    console.log("🔄 [handleActivityUpdate] newImageIds recebido:", newImageIds);

    let imageUrls = currentImageUrls || [];
    const uploadResult = await processUpload(request, this.activityConfig);
    console.log(
      "🔄 [handleActivityUpdate] Resultado do processUpload:",
      uploadResult
    );
    let fields = {};

    // Se newImageIds não foi fornecido, tentar extrair dos campos do upload
    if (!newImageIds && uploadResult?.fields?.imageIds) {
      try {
        const parsedIds = JSON.parse(uploadResult.fields.imageIds);
        newImageIds = Array.isArray(parsedIds) ? parsedIds : [];
        console.log(
          "✅ [handleActivityUpdate] imageIds extraídos dos campos:",
          newImageIds
        );
      } catch (error) {
        console.warn(
          "⚠️ [handleActivityUpdate] Erro ao fazer parse do imageIds:",
          error
        );
        newImageIds = [];
      }
    }

    // Se newImageIds foi definido (mesmo que seja array vazio), processar a atualização
    if (newImageIds !== undefined) {
      console.log(
        `📋 [handleActivityUpdate] Processando atualização com ${newImageIds.length} IDs`
      );

      if (uploadResult) {
        console.log(
          `🔄 Análise inteligente de ${uploadResult.images.length} imagem(ns) para atividade ${activityUuid}:`
        );

        const { imagesToKeep, imagesToDelete, imagesToUpload } =
          await this.analyzeImageChanges(
            currentImageUrls || [],
            newImageIds || [],
            uploadResult.images
          );

        console.log(`   📋 Análise concluída:`);
        console.log(`      - Manter: ${imagesToKeep.length} imagem(ns)`);
        console.log(`      - Deletar: ${imagesToDelete.length} imagem(ns)`);
        console.log(`      - Upload: ${imagesToUpload.length} imagem(ns)`);

        // Deletar apenas as imagens que não estão mais na lista
        if (imagesToDelete.length > 0) {
          console.log(
            `   🗑️ Deletando ${imagesToDelete.length} imagem(ns) removida(s):`
          );
          for (const imageUrl of imagesToDelete) {
            console.log(`      - ${imageUrl}`);
            await this.s3Service.deleteImage(imageUrl);
          }
        }

        // Fazer upload apenas das imagens realmente novas
        if (imagesToUpload.length > 0) {
          console.log(
            `   📤 Fazendo upload de ${imagesToUpload.length} nova(s) imagem(ns):`
          );
          const newImageUrls = await this.uploadImages(
            imagesToUpload,
            "activities",
            activityUuid
          );
          imageUrls = [...imagesToKeep, ...newImageUrls];
        } else {
          imageUrls = imagesToKeep;
        }

        fields = uploadResult.fields;
      } else {
        console.log(
          "⚠️ [handleActivityUpdate] Nenhum upload detectado, processando apenas reorganização"
        );
        // Se não há upload, manter apenas as imagens especificadas em newImageIds
        const imagesToKeep: string[] = [];
        const imagesToDelete: string[] = [];

        // Mapear imagens atuais por ID
        const currentImagesMap = new Map<string, string>();
        for (const url of currentImageUrls || []) {
          const imageId = this.extractImageIdFromUrl(url);
          currentImagesMap.set(imageId, url);
        }

        // Verificar quais imagens manter
        for (const [imageId, url] of currentImagesMap) {
          if (newImageIds.includes(imageId)) {
            imagesToKeep.push(url);
          } else {
            imagesToDelete.push(url);
          }
        }

        console.log(`📋 [handleActivityUpdate] Reorganização:`);
        console.log(`   - Manter: ${imagesToKeep.length} imagem(ns)`);
        console.log(`   - Deletar: ${imagesToDelete.length} imagem(ns)`);

        // Deletar imagens removidas
        if (imagesToDelete.length > 0) {
          console.log(
            `   🗑️ Deletando ${imagesToDelete.length} imagem(ns) removida(s):`
          );
          for (const imageUrl of imagesToDelete) {
            console.log(`      - ${imageUrl}`);
            await this.s3Service.deleteImage(imageUrl);
          }
        }

        imageUrls = imagesToKeep;
      }
    } else {
      console.log(
        "⚠️ [handleActivityUpdate] newImageIds não definido, mantendo imagens atuais"
      );
    }

    const activityData: IUpdateActivity = {
      ...(fields as IUpdateActivity),
      imageUrls: imageUrls, // Sempre incluir imageUrls, mesmo que seja array vazio
    };

    console.log("✅ [handleActivityUpdate] Resultado final:", {
      imageUrls: activityData.imageUrls,
    });
    return activityData;
  }

  async deleteImages(imageUrls: string[]): Promise<void> {
    if (imageUrls && imageUrls.length > 0) {
      for (const imageUrl of imageUrls) {
        await this.s3Service.deleteImage(imageUrl);
      }
    }
  }
}
