import { AdminRepository } from "../../repositories/AdminRepository";

export async function deleteAdmin(
  uuid: string,
  adminRepository: AdminRepository
) {
  const adminExists = await adminRepository.findByUuid(uuid);

  if (!adminExists) {
    throw new Error("Admin not found");
  }

  const deletedAdmin = await adminRepository.delete(uuid);


  return { message: "Admin deleted successfully" };
}
