export const logger = {
  error(message: string, context?: unknown): void {
    if (import.meta.env.DEV) {
      console.error(message, context);
    }
  },
};
