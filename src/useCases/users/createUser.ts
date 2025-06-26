import { randomUUID } from "crypto";
import { ICreateUser, IUser } from "../../interfaces/user";
import { UserRepository } from "../../repositories/UserRepository";

export async function createUser(
  payload: ICreateUser,
  userRepository: UserRepository
) {
  const { email } = payload;

  const userExists = await userRepository.findByEmail(email);

  if (userExists) {
    throw new Error("Usuário com este email já existe");
  }

  const userData: IUser = {
    uuid: randomUUID(),
    ...payload,
    role: "user",
    activitiesId: [],
    standsId: [],
  };

  const newUser = await userRepository.create(userData);
  if (!newUser) {
    throw new Error("Falha ao criar usuário");
  }
  return newUser;
}
