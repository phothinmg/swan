import { IncomingMessage } from "http";

interface ParsedUrl {
  query: string | null;
  search: string | null;
  href: string;
  path: string;
  pathname: string;
  _raw: string;
}

const parse_url = (req: IncomingMessage): ParsedUrl | undefined => {
  const url: string | undefined = req.url;
  if (url === undefined) return undefined;

  let obj: ParsedUrl | undefined = req["_parsedUrl"];
  if (obj && obj._raw === url) return obj;

  obj = {
    query: null,
    search: null,
    href: url,
    path: url,
    pathname: url,
    _raw: url,
  };

  const idx: number = url.indexOf("?", 1);
  if (idx !== -1) {
    obj.search = url.substring(idx);
    obj.query = obj.search.substring(1);
    obj.pathname = url.substring(0, idx);
  }

  obj._raw = url;

  return (req["_parsedUrl"] = obj);
};

export default parse_url;
