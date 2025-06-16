import { IUpdateUser } from "../../interfaces/user";
import { UserRepository } from "../../repositories/UserRepository";

export async function updateUser(
  uuidParam: string,
  payload: IUpdateUser,
  userRepository: UserRepository
) {
  const { uuid, firstName, lastName } = payload;

  const userDB = await userRepository.findByUuid(uuid);

  if (uuidParam !== userDB?.uuid) {
    throw new Error("You cannot update a user with a different UUID");
  }

  const userData = {
    uuid: userDB?.uuid,
    firstName,
    lastName,
    activitiesId: userDB.activitiesId,
    standsId: userDB.standsId,
  };

  return userRepository.update(userDB.uuid, userData);
}
