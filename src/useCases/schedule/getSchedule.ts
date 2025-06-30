import { ScheduleItem, ScheduleItemSchema } from "../../interfaces/schedule";
import { ActivityRepository } from "../../repositories/ActivityRepository";
import { StandRepository } from "../../repositories/StandRepository";

export async function getSchedule(
  activityRepository: ActivityRepository,
  standRepository: StandRepository
): Promise<ScheduleItem[]> {
  // Executa as consultas em paralelo
  const [activities, stands] = await Promise.all([
    activityRepository.getAll(),
    standRepository.getAll(),
  ]);

  // Converte atividades para o formato comum
  const activityItems = activities.map((activity) =>
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
  const standItems = stands.map((stand) =>
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
