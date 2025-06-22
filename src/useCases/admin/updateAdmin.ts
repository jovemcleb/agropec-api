import { hash } from "bcrypt";
import { IUpdateAdmin } from "../../interfaces/admin";
import { AdminRepository } from "../../repositories/AdminRepository";

export async function updateAdmin(
  uuidParam: string,
  payload: Partial<IUpdateAdmin>,
  adminRepository: AdminRepository
) {
  const { firstName, lastName, email, password } = payload;

  const adminDB = await adminRepository.findByUuidWithPassword(uuidParam);

  if (!adminDB) {
    throw new Error("Admin not found");
  }

  const hashedPassword = password ? await hash(password, 10) : adminDB.password;

  const adminDataToUpdate = {
    firstName: firstName ?? adminDB.firstName,
    lastName: lastName ?? adminDB.lastName,
    email: email ?? adminDB.email,
    password: hashedPassword,
  };

  return adminRepository.update(adminDB.uuid, adminDataToUpdate);
}
