import home from "../index.html";
import docs from "./docs.html";
import { handleTikTok } from "./tiktok.js";
import { handleInstagram } from "./instagram.js";
import { handleYoutube } from "./youtube.js"; 

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Home Page
    if (url.pathname === "/") {
      return new Response(home, {
        headers: {
          "content-type": "text/html; charset=UTF-8"
        }
      });
    }

    // Docs
    if (url.pathname === "/docs") {
      return new Response(docs, {
        headers: {
          "content-type": "text/html; charset=UTF-8"
        }
      });
    }

    // API TikTok
    if (url.pathname.startsWith("/api/tiktok")) {
      return handleTikTok(request);
    }

    // API Instagram
    if (url.pathname.startsWith("/api/instagram")) {
      return handleInstagram(request);
    }

    if (url.pathname.startsWith("/api/youtube")) {
     return handleYoutube(request);
    }

    // File Proxy
    if (url.pathname.startsWith("/file/")) {
      const src = url.searchParams.get("src");
      if (!src) {
        return new Response("No source", { status: 400 });
      }

      const res = await fetch(decodeURIComponent(src));
      const contentType = res.headers.get("content-type") || "application/octet-stream";

      return new Response(res.body, {
        headers: {
          "content-type": contentType,
          "Content-Disposition": "inline",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response("404 Not Found", { status: 404 });
  }
};
