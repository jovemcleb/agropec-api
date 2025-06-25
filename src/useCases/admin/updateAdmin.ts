import { hash } from "bcrypt";
import { IUpdateAdmin } from "../../interfaces/admin";
import { AdminRepository } from "../../repositories/AdminRepository";

interface IRequester {
  uuid: string;
  role: string;
}

export async function updateAdmin(
  requester: IRequester,
  uuidParam: string,
  payload: Partial<IUpdateAdmin>,
  adminRepository: AdminRepository
) {
  const { firstName, lastName, email, password } = payload;

  const adminDB = await adminRepository.findByUuidWithPassword(uuidParam);

  if (!adminDB) {
    throw new Error("Admin not found");
  }
  if (adminDB.role === "SUPER_ADMIN") {
    if (requester.uuid !== adminDB.uuid) {
      throw new Error(
        "Permission denied: Cannot modify a super administrator."
      );
    }
  }

  if (email && email !== adminDB.email) {
    const existingUserWithNewEmail = await adminRepository.findByEmail(email);

    if (existingUserWithNewEmail) {
      throw new Error("E-mail já está em uso por outro usuário");
    }
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
