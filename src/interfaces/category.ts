import { z } from "zod";

export type ICategory = z.infer<typeof CategorySchema>;

export type ICreateCategory = z.infer<typeof CreateCategorySchema>;

export interface ICategoryResponse {
  _id: string;
  uuid: string;
  name: string;
}

export const CategorySchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
});

export const CreateCategorySchema = CategorySchema.omit({
  uuid: true,
});
