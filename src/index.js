import home from "../index.html";
import docs from "./docs.html";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/docs") {
      return new Response(docs, {
        headers: { "content-type": "text/html;charset=UTF-8" }
      });
    }

    if (url.pathname === "/") {
      return new Response(home, {
        headers: { "content-type": "text/html;charset=UTF-8" }
      });
    }

    return new Response("404 Not Found", { status: 404 });
  }
};
