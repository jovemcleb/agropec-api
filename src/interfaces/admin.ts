import { z } from "zod";

export const LoginAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4, "Password must be at least 4 characters long"),
});

export const AdminSchema = z.object({
  uuid: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email(),
  password: z.string().min(4, "Password must be at least 4 characters long"),
  role: z.enum(["admin", "user", "staff"]),
});

export type ILoginAdmin = z.infer<typeof LoginAdminSchema>;

export type IAdmin = z.infer<typeof AdminSchema>;

export type AdminDTO = Omit<IAdmin, "uuid">;
