
import { pino, Logger } from "pino";

export const logger: Logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l o",
    },
  },
  level: "info",
});
