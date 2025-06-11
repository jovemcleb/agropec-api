import { AdminRepository } from "../../repositories/AdminRepository";

export async function findAllAdmins(adminRepository: AdminRepository) {
  const admins = await adminRepository.findAll();

  return admins;
}
