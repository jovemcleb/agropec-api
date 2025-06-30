import { z } from "zod";

const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
const timeRegex = /^\d{2}:\d{2}$/;

export const ScheduleItemSchema = z.object({
  type: z.enum(["activity", "stand"]),
  uuid: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  date: z
    .string()
    .refine((val) => dateRegex.test(val), {
      message: "Formato de data inválido. Use dd/mm/yyyy",
    })
    .refine(
      (val) => {
        const [day, month, year] = val.split("/").map(Number);
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
  startTime: z
    .string()
    .regex(timeRegex, {
      message: "Horário de início deve estar no formato HH:MM",
    })
    .optional(),
  endTime: z
    .string()
    .regex(timeRegex, {
      message: "Horário de término deve estar no formato HH:MM",
    })
    .optional(),
  openingTime: z
    .string()
    .regex(timeRegex, {
      message: "Horário de abertura deve estar no formato HH:MM",
    })
    .optional(),
  closingTime: z
    .string()
    .regex(timeRegex, {
      message: "Horário de fechamento deve estar no formato HH:MM",
    })
    .optional(),
  categoryId: z.string().min(1, "ID da categoria é obrigatório"),
  companyId: z.string().min(1, "ID da empresa é obrigatório"),
  imageUrls: z
    .array(z.string().url("URL da imagem deve ser uma URL válida"))
    .optional(),
});

export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;
