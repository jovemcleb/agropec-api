import { compare } from "bcrypt";
import { ILoginInput } from "../../interfaces/user";
import { UserRepository } from "../../repositories/UserRepository";

export async function loginCase(
  payload: ILoginInput,
  userRepository: UserRepository
) {
  const { email, password } = payload;

  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatch = await compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  return {
    uuid: user.uuid,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    activitiesId: user.activitiesId || [],
    standsId: user.standsId || [],
  };
}
