import { randomUUID } from "crypto";
import { AdminDTO } from "../../interfaces/admin";
import { AdminRepository } from "../../repositories/AdminRepository";

export async function createAdmin(
  payload: AdminDTO,
  adminRepository: AdminRepository
) {
  if (payload.role !== "admin" && payload.role !== "staff") {
    throw new Error("Role must be either 'admin' or 'staff'");
  }

  const { email } = payload;

  const adminExists = await adminRepository.findByEmail(email);

  if (adminExists) {
    throw new Error("Admin with this email already exists");
  }

  const adminData = {
    uuid: randomUUID(),
    ...payload,
  };

  const newAdmin = await adminRepository.create(adminData);

  if (!newAdmin) {
    throw new Error("Failed to create admin");
  }

  return newAdmin;
}
