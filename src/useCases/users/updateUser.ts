import { IUpdateUser } from "../../interfaces/user";
import { UserRepository } from "../../repositories/UserRepository";
import { hash } from "bcrypt";

export async function updateUser(
  uuidParam: string,
  payload: Partial<IUpdateUser>,
  userRepository: UserRepository
) {
  const { firstName, lastName, email, password } = payload;

  const userDB = await userRepository.findByUuidWithPassword(uuidParam);

  if (!userDB) {
    throw new Error("User not found");
  }

  if (email && email !== userDB.email) {
    const existingUserWithNewEmail = await userRepository.findByEmail(email);

    if (existingUserWithNewEmail) {
      throw new Error("E-mail já está em uso por outro usuário");
    }
  }

  const hashedPassword = password ? await hash(password, 10) : userDB.password;

  const userDataToUpdate = {
    firstName: firstName ?? userDB.firstName,
    lastName: lastName ?? userDB.lastName,
    email: email ?? userDB.email,
    password: hashedPassword,
  };

  return userRepository.update(userDB.uuid, userDataToUpdate);
}
