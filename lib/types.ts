import { IncomingMessage, ServerResponse } from "node:http";

export interface SwanHttpRequest extends IncomingMessage {}
export interface SwanRequest extends Request {}
export interface SwanHttpResponse extends ServerResponse {}
export type SwanResponse<T extends Response> = {
  sReq: T;
};
