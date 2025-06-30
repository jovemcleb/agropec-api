import { z } from "zod";
import { IActivityResponse } from "./activity";
import { IStandResponse } from "./stand";

export const HighlightSchema = z.object({
  uuid: z.string().uuid(),
  type: z.enum(["activity", "stand"], {
    errorMap: () => ({ message: "Tipo deve ser 'activity' ou 'stand'" }),
  }),
  referenceId: z.string().min(1, "ID de referência é obrigatório"),
});

// Schema para validação do request
export const CreateHighlightRequestSchema = HighlightSchema.omit({
  uuid: true,
});

// Schema para criação no banco de dados
export const CreateHighlightSchema = HighlightSchema.omit({ uuid: true });

// Schema para atualização
export const UpdateHighlightSchema = HighlightSchema.omit({
  uuid: true,
}).partial();

export type IHighlight = z.infer<typeof HighlightSchema>;
export type ICreateHighlight = z.infer<typeof CreateHighlightSchema>;
export type ICreateHighlightRequest = z.infer<typeof CreateHighlightRequestSchema>;
export type IUpdateHighlight = z.infer<typeof UpdateHighlightSchema>;

export interface IHighlightResponse extends IHighlight {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para resposta com dados relacionados
export interface IHighlightWithDetails extends IHighlightResponse {
  activity?: IActivityResponse;
  stand?: IStandResponse;
} 