import { UserRepository } from "../../repositories/UserRepository";

export async function addUserActivities(
  uuid: string,
  activitiesId: string[],
  userRepository: UserRepository
) {
  if (!activitiesId || activitiesId.length === 0) {
    throw new Error("Activities ID array cannot be empty");
  }

  const user = await userRepository.addActivities(uuid, activitiesId);

  if (!user) {
    throw new Error("Failed to add activities to user");
  }

  return user;
}
