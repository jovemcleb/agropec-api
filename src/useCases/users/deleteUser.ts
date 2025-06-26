import { UserRepository } from "../../repositories/UserRepository";

export async function deleteUser(
  uuidParam: string,
  userRepository: UserRepository
) {

  const deletedUser = await userRepository.delete(uuidParam);

  return deletedUser;
}
