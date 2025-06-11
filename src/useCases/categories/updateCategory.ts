import { ICategory } from "../../interfaces/category";
import { CategoryRepository } from "../../repositories/CategoryRepository";

export async function updateCategory(
  payload: ICategory,
  categoryRepository: CategoryRepository
) {
  const { uuid, name } = payload;

  const categoryExists = await categoryRepository.findByUuid(uuid);

  if (!categoryExists) {
    throw new Error("Category not found");
  }

  const updatedCategory = await categoryRepository.update(uuid, { name });

  if (!updatedCategory) {
    throw new Error("Failed to update category");
  }

  return updatedCategory;
}
