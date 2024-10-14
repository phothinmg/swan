import { App } from "@tinyhttp/app";
import sirv from "sirv";
import { cookieParser } from "@tinyhttp/cookie-parser";
import { serverPort, staticDir, _open, siteName } from "@/src/config/index.js";
import open from "open";
import { styleToDevServer } from "@/src/helpers/tcolor.js";
import serveStatic from "../../lib/serve_static.js";
//
function exit() {
  process.exit(0);
}
const assets = serveStatic(staticDir, {
  maxAge: 31536000, // 1Y
  immutable: true,
});
export default function devServe() {
  const hostName = "localhost";
  const app = new App();
  app.use(cookieParser());
  app.use(assets);
  process.on("SIGINT", exit);
  process.on("SIGTERM", exit);
  process.on("ELIFECYCLE", exit);
  app.listen(serverPort, () => {
    console.log(
      styleToDevServer({
        port: serverPort,
        siteName: siteName,
        hostName: hostName,
      })
    );
    setTimeout(async () => {
      if (_open) await open(`http://${hostName}:${serverPort}`);
    }, 1000);
  });
}
