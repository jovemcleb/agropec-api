import { z } from "zod";

const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

export const NotificationSchema = z.object({
  _id: z.string().optional(),
  uuid: z.string().uuid(),
  title: z.string().min(1, "Título é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  type: z.enum(["announcement", "alert", "system", "event"]),
  isScheduled: z.boolean().default(false),
  status: z.enum(["pending", "delivered", "read"]).default("pending"),
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
  time: z.string().regex(/^\d{2}:\d{2}$/, {
    message: "Horário deve estar no formato HH:MM",
  }),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  targetAudience: z
    .array(z.enum(["all", "admin", "exhibitors", "visitors", "staff"]))
    .default(["all"]),
});

export const CreateNotificationSchema = NotificationSchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateNotificationSchema = NotificationSchema.partial()
  .required({
    uuid: true,
  })
  .omit({
    createdAt: true,
    updatedAt: true,
  });

export type INotification = z.infer<typeof NotificationSchema>;
export type ICreateNotification = z.infer<typeof CreateNotificationSchema>;
export type IUpdateNotification = z.infer<typeof UpdateNotificationSchema>;

export interface INotificationResponse extends INotification {
  _id: string;
}

export type EventType = "activity" | "stand";

export interface IScheduledNotification {
  userId: string; // UUID
  eventId: string; // UUID
  type: string;
  nextInvocation: Date | null;
  userName?: string;
  eventName?: string;
  eventType: EventType;
  notificationType?: string;
}

export interface IScheduledNotificationResponse {
  success: boolean;
  message: string;
  data: IScheduledNotification[];
}
