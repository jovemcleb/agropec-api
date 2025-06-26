import { z } from "zod";

export const UserNotificationSchema = z.object({
  uuid: z.string().uuid(),
  userId: z.string().uuid(),
  message: z.string(),
  eventId: z.string().uuid(),
  eventType: z.enum(["activity", "stand"]),
  scheduledFor: z.date(),
  status: z.enum(["pending", "delivered", "read"]),
  createdAt: z.date(),
});

export type IUserNotification = z.infer<typeof UserNotificationSchema>;
