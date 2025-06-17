import { UserRepository } from "../../repositories/UserRepository";

export async function removeUserStands(
  uuid: string,
  standsId: string[],
  userRepository: UserRepository
) {
  if (!standsId || standsId.length === 0) {
    throw new Error("Stands ID array cannot be empty");
  }

  const user = await userRepository.removeStands(uuid, standsId);

  if (!user) {
    throw new Error("Failed to remove stands from user");
  }

  return user;
}
