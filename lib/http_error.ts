import { STATUS_CODES } from "node:http";
import { IncomingMessage, ServerResponse } from "node:http";
import { Swan } from "./swan.js";
import { SwanError } from "./error.js";

export const swanHttpError = (
  err: SwanError,
  _req: IncomingMessage,
  res: ServerResponse
) => {
  if (err instanceof Error) {
    console.error(err);
  }
  const code = err.statusCode in STATUS_CODES ? err.statusCode : err.status;
  if (typeof err === "string" || Buffer.isBuffer(err)) {
    res.writeHead(500).end(err);
  } else if (code in STATUS_CODES) {
    res.writeHead(code as number).end(STATUS_CODES[code]);
  } else {
    res.writeHead(500).end(err.message);
  }
};
