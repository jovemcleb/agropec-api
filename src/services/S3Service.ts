import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private baseUrl: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || "s3-agropec-bucket";
    this.region = process.env.AWS_REGION || "us-east-1";
    this.baseUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/`;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
      maxAttempts: 3, // Retry configuration
    });
  }

  async uploadImage(
    file: Buffer,
    key: string,
    mimetype: string
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimetype,
      CacheControl: "public, max-age=31536000", // Cache for 1 year
      Metadata: {
        "x-amz-meta-uploaded": new Date().toISOString(),
      },
    });

    try {
      await this.s3Client.send(command);
      return `${this.baseUrl}${key}`;
    } catch (error) {
      console.error("Erro ao fazer upload para S3:", error);
      throw new Error("Falha ao fazer upload da imagem");
    }
  }

  async deleteImage(key: string): Promise<void> {
    // Se a key for uma URL, extrair apenas a chave
    if (key.startsWith("http")) {
      key = key.replace(this.baseUrl, "");
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error("Erro ao deletar do S3:", error);
      throw new Error("Falha ao deletar a imagem");
    }
  }
}
