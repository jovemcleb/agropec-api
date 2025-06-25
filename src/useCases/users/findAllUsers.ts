import { UserRepository } from "../../repositories/UserRepository";

export async function findAllUsers(userRepository: UserRepository) {
  try {
    const users = await userRepository.findAll();
    return users;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Erro ao buscar usuários");
  }
}
