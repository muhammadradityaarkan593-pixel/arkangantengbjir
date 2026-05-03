export async function handleFile(request) {
  const url = new URL(request.url);
  const src = url.searchParams.get("src");

  if (!src) {
    return new Response("No Source", { status: 400 });
  }

  const realUrl = decodeURIComponent(src);
  const res = await fetch(realUrl);

  return new Response(res.body, {
    headers: {
      "content-type":
        url.pathname.endsWith(".mp3")
          ? "audio/mpeg"
          : "video/mp4"
    }
  });
}
