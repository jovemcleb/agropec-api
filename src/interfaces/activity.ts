import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const ActivitySchema = z
  .object({
    uuid: z.string().uuid(),
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    categoryId: z.string().min(1, 'ID da categoria é obrigatório'),
    latitude: z.number().min(-90).max(90, 'Latitude deve estar entre -90 e 90'),
    longitude: z.number().min(-180).max(180, 'Longitude deve estar entre -180 e 180'),
    imageUrl: z.string().url('URL da imagem inválida'),
    companyId: z.string().min(1, "ID da empresa é obrigatório"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Data inválida',
    }),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, {
      message: 'Horário de início deve estar no formato HH:MM',
    }),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, {
      message: 'Horário de término deve estar no formato HH:MM',
    }),
  })
  
export const CreateActivitySchema = ActivitySchema.omit({ uuid: true });
export const UpdateActivitySchema = ActivitySchema.partial().required({ uuid: true });

export type IActivity = z.infer<typeof ActivitySchema>;
export type ICreateActivity = z.infer<typeof CreateActivitySchema>;
export type IUpdateActivity = z.infer<typeof UpdateActivitySchema>;


export interface IActivityResponse extends IActivity {
  _id: string; 
  createdAt?: Date;
  updatedAt?: Date;
}
