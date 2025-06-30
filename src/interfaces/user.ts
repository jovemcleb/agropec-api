import { z } from "zod";
import { UserRoleSchema } from "../utils/user-role";

export const UserSchema = z.object({
  uuid: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  activitiesId: z.array(z.string().uuid()).optional(),
  standsId: z.array(z.string().uuid()).optional(),
  role: UserRoleSchema.default("user"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateUserSchema = UserSchema.omit({
  uuid: true,
  role: true,
  activitiesId: true,
  standsId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserSchema = z
  .object({
    uuid: z.string().uuid(),
  })
  .merge(
    UserSchema.omit({
      uuid: true,
      role: true,
      activitiesId: true,
      standsId: true,
      createdAt: true,
      updatedAt: true,
    }).partial()
  );

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

export type IUser = z.infer<typeof UserSchema>;
export type ICreateUser = z.infer<typeof CreateUserSchema>;
export type IUpdateUser = z.infer<typeof UpdateUserSchema>;
export type IUserActivities = z.infer<typeof UserActivitiesSchema>;
export type IUserStands = z.infer<typeof UserStandsSchema>;
export type ILoginInput = z.infer<typeof LoginSchema>;

export interface IUserResponse extends IUser {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
