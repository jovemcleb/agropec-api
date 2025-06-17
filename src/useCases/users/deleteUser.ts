import { UserRepository } from "../../repositories/UserRepository";

export async function deleteUser(
  uuidParam: string,
  uuidPayload: string,
  userRepository: UserRepository
) {
  const user = await userRepository.findByUuid(uuidParam);

  if (!user) {
    throw new Error("User not found");
  }

  if (uuidParam !== uuidPayload) {
    throw new Error("You cannot delete a user with a different UUID");
  }

  const deletedUser = await userRepository.delete(uuidParam);

  if (!deletedUser) {
    throw new Error("Failed to delete user");
  }

  return deletedUser;
}
