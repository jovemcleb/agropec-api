import { z } from "zod";

const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

export const StandSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  categoryId: z.string().min(1, "ID da categoria é obrigatório"),
  imageUrls: z
    .array(z.string().url("URL da imagem deve ser uma URL válida"))
    .optional(),
  date: z
    .string()
    .refine((val) => dateRegex.test(val), {
      message: "Formato de data inválido. Use dd/mm/yyyy",
    })
    .refine(
      (val) => {
        const [day, month, year] = val.split("/").map(Number);
        // JavaScript usa meses de 0-11, então subtraímos 1 do mês
        const date = new Date(year, month - 1, day);
        return (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        );
      },
      {
        message: "Data inválida",
      }
    ),
  companyId: z.string().min(1, "ID da empresa é obrigatório"),
  openingTime: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "Horário de início deve estar no formato HH:MM",
  }),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "Horário de término deve estar no formato HH:MM",
  }),
});

// Schema para validação do request multipart/form-data
export const CreateStandRequestSchema = StandSchema.omit({
  uuid: true,
  imageUrls: true,
});

// Schema para criação no banco de dados (após upload da imagem)
export const CreateStandSchema = StandSchema.omit({ uuid: true });

// Schema para atualização - todos os campos são opcionais exceto uuid que é excluído
export const UpdateStandSchema = StandSchema.omit({ uuid: true }).partial();

export type IStand = z.infer<typeof StandSchema>;
export type ICreateStand = z.infer<typeof CreateStandSchema>;
export type ICreateStandRequest = z.infer<typeof CreateStandRequestSchema>;
export type IUpdateStand = z.infer<typeof UpdateStandSchema>;

export interface IStandResponse extends IStand {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
