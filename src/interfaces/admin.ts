type UserRole = "admin" | "user" | "staff";

export interface IAdmin {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export type AdminDTO = Omit<IAdmin, "uuid">;

export interface ILoginInput {
  email: string;
  password: string;
}
