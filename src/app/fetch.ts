import $ from "dax-sh";
import type { RequestResponse } from "dax-sh";
import { warn2terminal } from "@/src/helpers/tcolor.js";
export default async function fetchRemote<T = undefined>(url: string) {
  const res = await $.request(url);
  if (res.ok) {
    return {
      data: res,
      toJson: () => res.json<T>(),
      toText: () => res.text(),
    };
  } else {
    throw new Error(warn2terminal(res.statusText));
  }
}
