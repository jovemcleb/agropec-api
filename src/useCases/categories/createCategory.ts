import { CategoryRepository } from "../../repositories/CategoryRepository";

export async function createCategory(
  payload: string,
  categoryRepository: CategoryRepository
) {
  const newCategory = {
    uuid: crypto.randomUUID(),
    name: payload,
  };

  const categoryExists = await categoryRepository.findByName(payload);
  if (categoryExists) {
    throw new Error("Category already exists");
  }

  const createdCategory = await categoryRepository.create(newCategory);

  return createdCategory;
}
