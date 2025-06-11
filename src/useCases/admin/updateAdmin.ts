import { IAdmin } from "../../interfaces/admin";
import { AdminRepository } from "../../repositories/AdminRepository";

export async function updateAdmin(
  payload: IAdmin,
  adminRepository: AdminRepository
) {
  const { uuid, firstName, lastName, email, role } = payload;

  const adminExists = await adminRepository.findByUuid(uuid);

  if (!adminExists) {
    throw new Error("Admin not found");
  }

  const updatedAdmin = await adminRepository.update(uuid, {
    firstName,
    lastName,
    email,
    role,
  });

  if (!updatedAdmin) {
    throw new Error("Failed to update admin");
  }

  return updatedAdmin;
}
