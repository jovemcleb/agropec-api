import { createHash, randomUUID } from "crypto";
import { FastifyRequest } from "fastify";
import sharp from "sharp";

interface ImageConfig {
  width?: number;
  height?: number;
  quality?: number;
}

interface UploadedImage {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  hash: string;
}

interface UploadResult {
  images: UploadedImage[];
  fields: Record<string, any>;
}

const DEFAULT_CONFIG: ImageConfig = {
  width: 1920,
  height: 1080,
  quality: 80,
};

// Cache para armazenar hashes de imagens na mesma request
const imageHashCache = new Set<string>();

export async function processUpload(
  request: FastifyRequest,
  config: ImageConfig = DEFAULT_CONFIG
): Promise<UploadResult | null> {
  try {
    const parts = request.parts();
    const images: UploadedImage[] = [];
    const fields: Record<string, any> = {};
    const imageHashes: string[] = []; // Array para armazenar hashes de todas as imagens

    // Processar todas as partes do multipart
    for await (const part of parts) {
      if (part.type === "file") {
        // Validar tipo do arquivo
        if (!part.mimetype.startsWith("image/")) {
          console.error(
            "❌ [processUpload] Tipo de arquivo inválido:",
            part.mimetype
          );
          throw new Error("Apenas imagens são permitidas");
        }

        const buffer = await part.toBuffer();

        // Gerar hash da imagem original
        const hash = createHash("md5").update(buffer).digest("hex");

        // Verificar se já existe uma imagem com o mesmo hash na request
        if (imageHashes.includes(hash)) {
          throw new Error("Imagem duplicada detectada na mesma requisição");
        }

        // Verificar se já existe uma imagem com o mesmo hash no cache global
        if (imageHashCache.has(hash)) {
          throw new Error(
            "Imagem duplicada detectada (já foi enviada anteriormente)"
          );
        }

        imageHashes.push(hash);

        // Otimizar imagem
        const optimizedBuffer = await sharp(buffer)
          .resize({
            width: config.width,
            height: config.height,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: config.quality })
          .toBuffer();

        // Gerar hash da imagem otimizada
        const optimizedHash = createHash("md5")
          .update(optimizedBuffer)
          .digest("hex");

        // Adicionar ao cache global
        imageHashCache.add(optimizedHash);

        // Gerar nome único usando UUID
        const filename = `${randomUUID()}.jpg`;

        images.push({
          buffer: optimizedBuffer,
          filename,
          mimetype: "image/jpeg",
          hash: optimizedHash,
        });
      } else {
        // Campo de formulário
        let value: any = part.value;

        // Converter strings numéricas para números
        if (part.fieldname === "latitude" || part.fieldname === "longitude") {
          value = parseFloat(value as string);
          if (isNaN(value)) {
            throw new Error(`${part.fieldname} deve ser um número válido`);
          }
        }

        fields[part.fieldname] = value;
      }
    }

    // Retornar resultado mesmo se não há imagens (pode ter apenas campos)
    // Só retorna null se não há nem imagens nem campos
    if (images.length === 0 && Object.keys(fields).length === 0) {
      return null;
    }

    return {
      images,
      fields,
    };
  } catch (error) {
    console.error("❌ [processUpload] Erro ao processar upload:", error);
    throw error;
  }
}

// Função para limpar cache (chamada automaticamente a cada 24 horas)
export function clearImageHashCache(): void {
  imageHashCache.clear();
}
