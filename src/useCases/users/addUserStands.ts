import { UserRepository } from "../../repositories/UserRepository";

export async function addUserStands(
  uuid: string,
  standsId: string[],
  userRepository: UserRepository
) {
  if (!standsId || standsId.length === 0) {
    throw new Error("Stands ID array cannot be empty");
  }

  const user = await userRepository.addStand(uuid, standsId);

  if (!user) {
    throw new Error("Failed to add stands to user");
  }

  return user;
}
