import docsHtml from './docs.html';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/docs") {
      return new Response(docsHtml, {
        headers: {
          "content-type": "text/html; charset=UTF-8"
        }
      });
    }

    return new Response("Home Page");
  }
}
