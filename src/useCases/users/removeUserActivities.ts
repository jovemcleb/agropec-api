import { UserRepository } from "../../repositories/UserRepository";

export async function removeUserActivities(
  uuid: string,
  activitiesId: string[],
  userRepository: UserRepository
) {
  if (!activitiesId || activitiesId.length === 0) {
    throw new Error("Activities ID array cannot be empty");
  }

  const user = await userRepository.removeActivities(uuid, activitiesId);

  if (!user) {
    throw new Error("Failed to remove activities from user");
  }

  return user;
}
