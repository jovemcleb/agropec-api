import { z } from "zod";

export const NotificationSchema = z.object({
  uuid: z.string().uuid(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data inválida",
  }),
  time: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "Horário deve estar no formato HH:MM",
  }),
  message: z.string().min(1, "Mensagem é obrigatória"),
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  standId: z.string().min(1, "ID do stand é obrigatório"),
  activityId: z.string().min(1, "ID da atividade é obrigatório"),
});

export const CreateNotificationSchema = NotificationSchema.omit({ uuid: true });
export const UpdateNotificationSchema = NotificationSchema.partial().required({ uuid: true });

export type INotification = z.infer<typeof NotificationSchema>;
export type ICreateNotification = z.infer<typeof CreateNotificationSchema>;
export type IUpdateNotification = z.infer<typeof UpdateNotificationSchema>;

export interface INotificationResponse extends INotification {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}