import { ScheduleItem, ScheduleItemSchema } from "../../interfaces/schedule";
import { ActivityRepository } from "../../repositories/ActivityRepository";
import { StandRepository } from "../../repositories/StandRepository";
import { UserRepository } from "../../repositories/UserRepository";

export async function getUserSchedule(
  uuid: string,
  userRepository: UserRepository,
  activityRepository: ActivityRepository,
  standRepository: StandRepository
): Promise<ScheduleItem[]> {
  // Busca o usuário
  const user = await userRepository.findByUuid(uuid);
  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  // Busca as atividades e stands do usuário em paralelo
  const [activities, stands] = await Promise.all([
    Promise.all(
      (user.activitiesId || []).map((id) => activityRepository.getByUuid(id))
    ),
    Promise.all(
      (user.standsId || []).map((id) => standRepository.getByUuid(id))
    ),
  ]);

  // Filtra os itens nulos (caso alguma atividade ou stand tenha sido deletado)
  const validActivities = activities.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );
  const validStands = stands.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );

  // Converte atividades para o formato comum
  const activityItems = validActivities.map((activity) =>
    ScheduleItemSchema.parse({
      type: "activity",
      uuid: activity.uuid,
      name: activity.name,
      description: activity.description,
      date: activity.date,
      startTime: activity.startTime,
      endTime: activity.endTime,
      categoryId: activity.categoryId,
      companyId: activity.companyId,
      imageUrls: activity.imageUrls,
    })
  );

  // Converte stands para o formato comum
  const standItems = validStands.map((stand) =>
    ScheduleItemSchema.parse({
      type: "stand",
      uuid: stand.uuid,
      name: stand.name,
      description: stand.description,
      date: stand.date,
      openingTime: stand.openingTime,
      closingTime: stand.closingTime,
      categoryId: stand.categoryId,
      companyId: stand.companyId,
      imageUrls: stand.imageUrls,
    })
  );

  // Combina todos os itens
  const allItems = [...activityItems, ...standItems];

  // Ordena por data e hora
  return allItems.sort((a, b) => {
    // Primeiro compara as datas
    const [dayA, monthA, yearA] = a.date.split("/").map(Number);
    const [dayB, monthB, yearB] = b.date.split("/").map(Number);

    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);

    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }

    // Se as datas são iguais, compara as horas
    const timeA = a.type === "activity" ? a.startTime : a.openingTime;
    const timeB = b.type === "activity" ? b.startTime : b.openingTime;

    if (!timeA && !timeB) return 0;
    if (!timeA) return 1;
    if (!timeB) return -1;

    const [hoursA, minutesA] = timeA.split(":").map(Number);
    const [hoursB, minutesB] = timeB.split(":").map(Number);

    if (hoursA !== hoursB) {
      return hoursA - hoursB;
    }

    return minutesA - minutesB;
  });
}
