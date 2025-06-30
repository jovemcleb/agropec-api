import { z } from "zod";

export type ICategory = z.infer<typeof CategorySchema>;

export type ICreateCategory = z.infer<typeof CreateCategorySchema>;

export interface ICategoryResponse {
  _id: string;
  uuid: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CategorySchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateCategorySchema = CategorySchema.omit({
  uuid: true,
  createdAt: true,
  updatedAt: true,
});
