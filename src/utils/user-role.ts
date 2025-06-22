import { z } from "zod";

export const UserRoleSchema = z.enum(["admin", "user", "staff"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

