import home from "../index.html";
import docs from "./docs.html";
import { handleTikTok } from "./tiktok.js";
import { handleFile } from "./file.js";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(home, {
        headers: { "content-type": "text/html;charset=UTF-8" }
      });
    }

    if (url.pathname === "/docs") {
      return new Response(docs, {
        headers: { "content-type": "text/html;charset=UTF-8" }
      });
    }

    if (url.pathname.startsWith("/api/tiktok")) {
      return handleTikTok(request);
    }

    if (url.pathname.startsWith("/file/")) {
      return handleFile(request);
    }

    return new Response("404 Not Found", { status: 404 });
  }
};    if (url.pathname.startsWith('/api/tiktok')) {
      return handleTikTok(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

