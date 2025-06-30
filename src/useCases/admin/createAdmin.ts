import { randomUUID } from "crypto";
import { ICreateAdmin } from "../../interfaces/admin";
import { AdminRepository } from "../../repositories/AdminRepository";
import { AdminRoleSchema } from "../../utils/user-role";

export async function createAdmin(
  payload: ICreateAdmin,
  adminRepository: AdminRepository
) {
  const existingAdmin = await adminRepository.findByEmail(payload.email);

  if (existingAdmin) {
    throw new Error("Email already registered");
  }

  const admin = {
    uuid: randomUUID(),
    ...payload,
    role: AdminRoleSchema.enum.admin,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return adminRepository.create(admin);
}
