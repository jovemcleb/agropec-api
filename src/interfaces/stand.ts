import { z } from "zod";

export const StandSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  categoryId: z.string().min(1, "ID da categoria é obrigatório"),
  latitude: z.number().min(-90).max(90, "Latitude deve estar entre -90 e 90"),
  longitude: z
    .number()
    .min(-180)
    .max(180, "Longitude deve estar entre -180 e 180"),
  imageUrl: z.string().url("URL da imagem inválida"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data inválida",
  }),
  companyId: z.string().min(1, "ID da empresa é obrigatório"),
  openingHours: z.object({
    openingTime: z.string().regex(/^\d{2}:\d{2}$/, {
      message: "Horário de início deve estar no formato HH:MM",
    }),
    closingTime: z.string().regex(/^\d{2}:\d{2}$/, {
      message: "Horário de término deve estar no formato HH:MM",
    }),
  }),
});

export const CreateStandSchema = StandSchema.omit({ uuid: true });
export const UpdateStandSchema = StandSchema.partial().required({ uuid: true });

export type IStand = z.infer<typeof StandSchema>;
export type ICreateStand = z.infer<typeof CreateStandSchema>;
export type IUpdateStand = z.infer<typeof UpdateStandSchema>;

export interface IStandResponse extends IStand {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
