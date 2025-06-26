import { z } from "zod";

// Roles do sistema:
// SUPER_ADMIN: Administrador com poderes totais, incluindo gestão de outros admins
// admin: Administrador regular com acesso a funcionalidades administrativas
// staff: Equipe de suporte com privilégios limitados
// user: Usuário regular do sistema
export const UserRoleSchema = z.enum(["SUPER_ADMIN", "admin", "staff", "user"]);
export type UserRole = z.infer<typeof UserRoleSchema>;
