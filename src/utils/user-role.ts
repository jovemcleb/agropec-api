import { z } from "zod";

// Roles de usuários comuns
export const UserRoleSchema = z.enum(["user"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Roles de administradores
export const AdminRoleSchema = z.enum(["SUPER_ADMIN", "admin"]);
export type AdminRole = z.infer<typeof AdminRoleSchema>;

// Todos os roles do sistema (para uso geral quando necessário)
export const SystemRoleSchema = z.enum(["SUPER_ADMIN", "admin", "user"]);
export type SystemRole = z.infer<typeof SystemRoleSchema>;
