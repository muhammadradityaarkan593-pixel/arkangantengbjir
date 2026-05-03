export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/docs") {
      return new Response(`
        <html>
          <body style="background:black;color:white">
            <h1>DOCS BERHASIL</h1>
          </body>
        </html>
      `, {
        headers: {
          "content-type": "text/html;charset=UTF-8"
        }
      });
    }

    return new Response("HOME");
  }
}
