import { z } from "zod";

export type IAdmin = z.infer<typeof AdminSchema>;
export type ICreateAdmin = z.infer<typeof CreateAdminSchema>;
export type IUpdateAdmin = z.infer<typeof UpdateAdminSchema>;

export type ILoginInput = z.infer<typeof LoginSchema>;

// Roles específicos para administradores
// SUPER_ADMIN: Pode gerenciar outros admins e tem acesso total ao sistema
// admin: Pode gerenciar recursos mas não pode gerenciar outros admins
export const AdminRoleSchema = z.enum(["SUPER_ADMIN", "admin"]);

export const AdminSchema = z.object({
  uuid: z.string().uuid(),
  firstName: z.string().min(1, "First name cannot be empty"),
  lastName: z.string().min(1, "Last name cannot be empty"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: AdminRoleSchema.default("admin"),
});

// Schema para criação - note que o role não pode ser especificado na criação
// pois será sempre "admin" quando criado por um SUPER_ADMIN
export const CreateAdminSchema = AdminSchema.omit({ uuid: true, role: true });

export const UpdateAdminSchema = z.object({
  uuid: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password cannot be empty"),
});
