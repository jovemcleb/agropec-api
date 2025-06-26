import { randomUUID } from "crypto";
import { ICreateUser } from "../../interfaces/user";
import { UserRepository } from "../../repositories/UserRepository";

export async function createUser(
  payload: ICreateUser,
  userRepository: UserRepository
) {
  if (payload.role !== "user") {
    throw new Error("A role para um novo usuário deve ser 'user'");
  }
  const { email } = payload;

  const userExists = await userRepository.findByEmail(email);

  if (userExists) {
    throw new Error("Usuário com este email já existe");
  }
  const userData = {
    uuid: randomUUID(),
    ...payload,
  };

  const newUser = await userRepository.create(userData);
  if (!newUser) {
    throw new Error("Falha ao criar usuário");
  }
  return newUser;
}
