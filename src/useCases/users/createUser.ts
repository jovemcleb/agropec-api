import { randomUUID } from "crypto";
import { ICreateUser } from "../../interfaces/user";
import { UserRepository } from "../../repositories/UserRepository";

export async function createUser(
  payload: ICreateUser,
  userRepository: UserRepository
) {
  const { firstName, lastName } = payload;

  const userData = {
    uuid: randomUUID(),
    firstName,
    lastName,
    activitiesId: [],
    standsId: [],
  };

  const user = await userRepository.create(userData);

  return user;
}
