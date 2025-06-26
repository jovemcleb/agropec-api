import { z } from "zod";

export const UserRoleSchema = z.enum(["admin", "user", "staff", "SUPER_ADMIN"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

