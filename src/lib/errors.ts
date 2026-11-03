/** The `message` of a thrown value, when it has one (Error objects and error-like objects). */
export function errorMessage(error: unknown): string | undefined {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return undefined;
}
