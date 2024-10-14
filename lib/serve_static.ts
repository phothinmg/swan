import fs from "node:fs";
import { join, normalize, resolve } from "node:path";
import type {
  IncomingMessage,
  ServerResponse,
  IncomingHttpHeaders,
} from "node:http";
import type { Request, Response } from "@tinyhttp/app";

import type { Stats } from "node:fs";
import { totalist } from "totalist/sync";
import { lookup } from "mrmime";
import parse_url from "./parse_url.js";
//
type HeaderKeys =
  | "Content-Type"
  | "Content-Range"
  | "Content-Length"
  | "Accept-Ranges"
  | "Cache-Control"
  | "Last-Modified"
  | "ETag"
  | "Content-Encoding";
//
interface Options {
  onNoMatch?: (req: IncomingMessage, res: ServerResponse) => void;
  setHeaders?: (res: ServerResponse, pathname: string, stats: Stats) => void;
  extensions?: string[];
  gzip?: boolean;
  brotli?: boolean;
  etag?: boolean;
  single?: string | boolean;
  ignores?: string | RegExp | boolean | ConcatArray<never>;
  maxAge?: number;
  immutable?: boolean;
  dev?: boolean;
  dotfiles?: boolean;
}
//
const ENCODING: Record<string, string> = {
  ".br": "br",
  ".gz": "gzip",
};
const noop = () => {};
function is_404(req: Request, res: ServerResponse): void {
  res.statusCode = 404;
  res.end();
}
/*
This function generates an array of possible file paths based on a given URI and an array of file extensions.

Here's a breakdown:

It removes the trailing slash from the URI if present.
It creates an array to store the possible file paths.
It loops through each file extension and:
If the extension is not empty, it appends the extension to the URI and adds it to the array.
It appends the extension to the URI with "/index" appended and adds it to the array.
The function returns the array of possible file paths.

In essence, it's generating possible file paths by combining the URI with 
different extensions and also considering an "index" file for each extension.


*/
function is_match(uri: string, arr: RegExp[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].test(uri)) return true;
  }
  return false;
}
function to_assume(uri: string, exts: string[]): string[] {
  let i: number = 0;
  let x: string;
  let len: number = uri.length - 1;
  if (uri.charCodeAt(len) === 47) {
    uri = uri.substring(0, len);
  }

  let arr: string[] = [];
  let tmp: string = `${uri}/index`;
  for (; i < exts.length; i++) {
    x = exts[i] ? `.${exts[i]}` : "";
    if (uri) arr.push(uri + x);
    arr.push(tmp + x);
  }

  return arr;
}

function via_cache(cache: Record<string, any>, uri: string, exts: string[]) {
  let i: number = 0;
  let data: any;
  let arr: string[] = to_assume(uri, exts);
  for (; i < arr.length; i++) {
    if ((data = cache[arr[i]])) return data;
  }
}

function via_local(
  dir: string,
  isEtag: boolean,
  uri: string,
  exts: string[]
):
  | {
      abs: string;
      stats: any;
      headers: Partial<IncomingHttpHeaders>;
    }
  | undefined {
  let i: number = 0;
  let arr: string[] = to_assume(uri, exts);
  let abs: string;
  let stats: any;
  let name: string;
  let headers: Partial<IncomingHttpHeaders>;
  for (; i < arr.length; i++) {
    abs = normalize(join(dir, (name = arr[i])));
    if (abs.startsWith(dir) && fs.existsSync(abs)) {
      stats = fs.statSync(abs);
      if (stats.isDirectory()) continue;
      headers = toHeaders(name, stats, isEtag);
      headers["Cache-Control"] = isEtag ? "no-cache" : "no-store";
      return { abs, stats, headers };
    }
  }
}
function toHeaders(name: string, stats: Stats, isEtag: boolean) {
  let enc: string | undefined = ENCODING[name.slice(-3)];

  let contentType: string = lookup(name.slice(0, enc ? -3 : undefined)) || "";
  if (contentType === "text/html") contentType += ";charset=utf-8";

  let headers: Partial<IncomingHttpHeaders> = {
    "Content-Length": `${stats.size}`,
    "Content-Type": contentType,
    "Last-Modified": stats.mtime.toUTCString(),
  };

  if (enc) headers["Content-Encoding"] = enc;
  if (isEtag) headers["ETag"] = `W/"${stats.size}-${stats.mtime.getTime()}"`;

  return headers;
}

function send(
  req: IncomingMessage,
  res: ServerResponse,
  file: string,
  stats: Stats,
  headers: IncomingHttpHeaders
): ServerResponse<IncomingMessage> | undefined {
  let code: number = 200;
  let tmp: string | string[] | number | undefined;
  let opts: { start?: number; end?: number } = {};

  for (let key in headers) {
    tmp = res.getHeader(key);
    if (tmp) headers[key] = tmp as string | string[];
  }

  if ((tmp = res.getHeader("content-type"))) {
    headers["Content-Type"] = tmp as string;
  }

  if (req.headers.range) {
    code = 206;
    let [x, y] = req.headers.range.replace("bytes=", "").split("-");
    let end: number = (opts.end = parseInt(y, 10) || stats.size - 1);
    let start: number = (opts.start = parseInt(x, 10) || 0);

    if (end >= stats.size) {
      end = stats.size - 1;
    }

    if (start >= stats.size) {
      res.setHeader("Content-Range", `bytes */${stats.size}`);
      res.statusCode = 416;
      return res.end();
    }

    headers["Content-Range"] = `bytes ${start}-${end}/${stats.size}`;
    headers["Content-Length"] = `${end - start + 1}`;
    headers["Accept-Ranges"] = "bytes";
  }

  res.writeHead(code, headers);
  fs.createReadStream(file, opts).pipe(res);
}

export default function serveStatic(dir: string, opts: Options = {}) {
  dir = resolve(dir || ".");
  const isNotFound:
    | ((req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void)
    | ((req: Request, res: ServerResponse<IncomingMessage>) => void) =
    opts.onNoMatch || is_404;
  const setHeaders: (
    res: ServerResponse,
    pathname: string,
    stats: any
  ) => void = opts.setHeaders || noop;

  const extensions: string[] = opts.extensions || ["html", "htm"];
  const gzips: string[] | undefined = opts.gzip
    ? extensions.map((x) => `${x}.gz`).concat("gz")
    : undefined;
  const brots: string[] | undefined = opts.brotli
    ? extensions.map((x) => `${x}.br`).concat("br")
    : undefined;

  const FILES: { [key: string]: { abs: string; stats: any; headers: any } } =
    {};

  let fallback: string = "/";
  const isEtag: boolean = !!opts.etag;
  const isSPA: boolean = !!opts.single;
  if (typeof opts.single === "string") {
    const idx: number = opts.single.lastIndexOf(".");
    fallback += !!~idx ? opts.single.substring(0, idx) : opts.single;
  }

  const ignores: RegExp[] = [];
  if (opts.ignores !== false) {
    ignores.push(/[/]([A-Za-z\s\d~$._-]+\.\w+){1,}$/);
    if (opts.dotfiles) ignores.push(/\/\.\w/);
    else ignores.push(/\/\.well-known/);
    [].concat(opts.ignores as ConcatArray<never>).forEach((x) => {
      ignores.push(new RegExp(x as string, "i"));
    });
  }

  let cc: string | undefined =
    opts.maxAge != null ? `public,max-age=${opts.maxAge}` : undefined;
  if (cc && opts.immutable) cc += ",immutable";
  else if (cc && opts.maxAge === 0) cc += ",must-revalidate";

  if (!opts.dev) {
    totalist(dir, (name: string, abs: string, stats: any) => {
      if (/\.well-known[\\+\/]/.test(name)) {
      } else if (!opts.dotfiles && /(^\.|[\\+|\/+]\.)/.test(name)) return;

      const headers: any = toHeaders(name, stats, isEtag);
      if (cc) headers["Cache-Control"] = cc;

      FILES["/" + name.normalize().replace(/\\+/g, "/")] = {
        abs,
        stats,
        headers,
      };
    });
  }

  const lookup: (pathname: string, exts: string[]) => any = opts.dev
    ? via_local.bind(0, dir, isEtag)
    : via_cache.bind(0, FILES);

  return function (
    req: IncomingMessage & Request,
    res: ServerResponse,
    next?: () => void
  ) {
    let exts: string[] = [""];
    let pathname: string = parse_url(req)?.pathname ?? "";
    const val: string | string[] = req.headers["accept-encoding"] ?? "";
    if (gzips && val.includes("gzip")) exts.unshift(...gzips);
    if (brots && /(br|brotli)/i.test(val as string)) exts.unshift(...brots);
    exts.push(...extensions);

    if (pathname.indexOf("%") !== -1) {
      try {
        pathname = decodeURI(pathname);
      } catch (err) {}
    }

    const data =
      lookup(pathname, exts) ||
      (isSPA && !is_match(pathname, ignores) && lookup(fallback, exts));
    if (!data) return next ? next() : isNotFound(req, res);

    if (isEtag && req.headers["if-none-match"] === data.headers["ETag"]) {
      res.writeHead(304);
      return res.end();
    }

    if (gzips || brots) {
      res.setHeader("Vary", "Accept-Encoding");
    }

    setHeaders(res, pathname, data.stats);
    send(req, res, data.abs, data.stats, data.headers);
  };
}
