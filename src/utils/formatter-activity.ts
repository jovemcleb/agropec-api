import { ZodError } from "zod";

export function handleError(error: unknown, defaultMessage: string): Error {
  if (error instanceof ZodError) {
    const messages = error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message}`
    );
    return new Error(`Dados inválidos: ${messages.join(", ")}`);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(defaultMessage);
}

export function validateTimeRange(startTime: string, endTime: string): void {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (startMinutes >= endMinutes) {
    throw new Error(
      "Horário de início deve ser anterior ao horário de término"
    );
  }
}
