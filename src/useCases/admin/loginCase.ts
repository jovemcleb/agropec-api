import { compare } from "bcrypt";
import { ILoginInput } from "../../interfaces/admin";
import { AdminRepository } from "../../repositories/AdminRepository";

export async function loginCase(
  payload: ILoginInput,
  adminRepository: AdminRepository
) {
  const { email, password } = payload;

  const admin = await adminRepository.findByEmail(email);

  if (!admin) {
    throw new Error("Invalid email or password");
  }

  const passwordMatch = await compare(password, admin.password);

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  return {
    uuid: admin.uuid,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    role: admin.role,
  };
}
