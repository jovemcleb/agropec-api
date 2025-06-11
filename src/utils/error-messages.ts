import { FastifyError } from "fastify";

interface ValidationError {
  instancePath: string;
  message: string;
}

export function formatValidationError(
  error: FastifyError & { validation: ValidationError[] }
) {
  const validationErrors = error.validation
    .map((error) => {
      const field = error.instancePath
        .slice(1)
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const message = error.message?.toLowerCase() ?? "invalid";
      const needsIs =
        !message.includes("is") &&
        !message.includes("are") &&
        !message.includes("must");
      return `${field} ${needsIs ? "is " : ""}${message}`;
    })
    .join(". ");

  return validationErrors;
}
