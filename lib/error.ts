import { exitCode } from "node:process";
import { ServerResponse } from "node:http";
export class SwanError extends Error {
  status: ServerResponse["statusMessage"];
  statusCode: ServerResponse["statusCode"];
  constructor(message: string, options: ErrorOptions) {
    super(message, options);
  }
}
