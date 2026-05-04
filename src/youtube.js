const COBALT_API = "https://api.cobalt.tools/";
const BASE_URL = "https://arkannhosting.my.id";

export async function handleYoutube(request) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  const ytUrl = url.searchParams.get("url");
  const quality = url.searchParams.get("quality") || "1080"; // default 1080p
  const audioOnly = url.searchParams.get("audio") === "true";

  if (!ytUrl) {
    return Response.json({ error: "Parameter ?url= diperlukan" }, { status: 400 });
  }

  try {
    const body = {
      url: ytUrl,
      videoQuality: quality,
    };

    if (audioOnly) {
      body.downloadMode = "audio";
    }

    const cobaltRes = await fetch(COBALT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!cobaltRes.ok) {
      const err = await cobaltRes.json();
      return Response.json({ error: err?.error?.code || "Gagal fetch dari Cobalt" }, { status: 502 });
    }

    const data = await cobaltRes.json();

    if (data.status === "stream" || data.status === "redirect") {
      const encoded = encodeURIComponent(data.url);
      return Response.json({
        status: "success",
        type: audioOnly ? "audio" : "video",
        quality: audioOnly ? null : quality + "p",
        url: data.url,
        proxy: `${BASE_URL}/file/?src=${encoded}`
      }, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    return Response.json({ error: "Response tidak dikenali", raw: data }, { status: 502 });

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
