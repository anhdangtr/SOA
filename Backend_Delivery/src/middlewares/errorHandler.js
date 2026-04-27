import { ZodError } from "zod";

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Invalid request payload",
      issues: error.issues.map((issue) => issue.message),
    });
    return;
  }

  console.error(error);
  response.status(500).json({ message: "Internal server error" });
}
