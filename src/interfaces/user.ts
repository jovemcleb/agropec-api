import { z } from "zod";
import { UserRoleSchema } from "../utils/user-role";


export type IUser = z.infer<typeof UserSchema>;
export type ICreateUser = z.infer<typeof CreateUserSchema>;
export type IUpdateUser = z.infer<typeof UpdateUserSchema>;
export type IUserActivities = z.infer<typeof UserActivitiesSchema>;
export type IUserStands = z.infer<typeof UserStandsSchema>;
export type ILoginInput = z.infer<typeof LoginSchema>;

export const UserSchema = z.object({
  uuid: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string(),
  activitiesId: z.array(z.string().uuid()).optional(),
  standsId: z.array(z.string().uuid()).optional(),
  role: UserRoleSchema.default("user"), 
});

export const CreateUserSchema = UserSchema.omit({
  uuid: true,
});

export const UpdateUserSchema = z.object({
  uuid: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export const UserActivitiesSchema = z.object({
  activitiesId: z.array(z.string().uuid()),
});

export const UserStandsSchema = z.object({
  standsId: z.array(z.string().uuid()),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password cannot be empty"),
});
