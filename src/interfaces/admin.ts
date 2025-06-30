import { z } from "zod";
import { AdminRoleSchema } from "../utils/user-role";

export const AdminSchema = z.object({
  uuid: z.string().uuid(),
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  role: AdminRoleSchema.default("admin"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateAdminSchema = AdminSchema.omit({
  uuid: true,
  role: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateAdminSchema = z
  .object({
    uuid: z.string().uuid(),
  })
  .merge(
    AdminSchema.omit({
      uuid: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }).partial()
  );

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha não pode estar vazia"),
});

export type IAdmin = z.infer<typeof AdminSchema>;
export type ICreateAdmin = z.infer<typeof CreateAdminSchema>;
export type IUpdateAdmin = z.infer<typeof UpdateAdminSchema>;
export type ILoginInput = z.infer<typeof LoginSchema>;

export interface IAdminResponse extends IAdmin {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
