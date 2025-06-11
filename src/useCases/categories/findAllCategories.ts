import { CategoryRepository } from "../../repositories/CategoryRepository";

export async function findAllCategories(
  categoryRepository: CategoryRepository
) {
  const categories = await categoryRepository.findAll();

  return categories;
}
