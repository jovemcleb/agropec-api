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

