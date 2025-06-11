import { CategoryRepository } from "../../repositories/CategoryRepository";

export async function deleteCategory(
  uuid: string,
  categoryRepository: CategoryRepository
) {
  const categoryExists = await categoryRepository.findByUuid(uuid);

  if (!categoryExists) {
    throw new Error("Category not found");
  }

  await categoryRepository.delete(uuid);

  return { message: "Category deleted successfully" };
}
