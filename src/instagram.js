const COBALT_API = "https://api.cobalt.tools/";
const BASE_URL = "https://arkannhosting.my.id";

export async function handleInstagram(request) {
  const url = new URL(request.url);

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }

  const igUrl = url.searchParams.get("url");
  if (!igUrl) {
    return Response.json({ error: "Parameter ?url= diperlukan" }, { status: 400 });
  }

  try {
    const cobaltRes = await fetch(COBALT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ url: igUrl })
    });

    if (!cobaltRes.ok) {
      const err = await cobaltRes.json();
      return Response.json({ error: err?.error?.code || "Gagal fetch dari Cobalt" }, { status: 502 });
    }

    const data = await cobaltRes.json();

    // Cobalt bisa return single url atau multiple picker
    if (data.status === "stream" || data.status === "redirect") {
      const encoded = encodeURIComponent(data.url);
      return Response.json({
        status: "success",
        type: "video",
        url: data.url,
        proxy: `${BASE_URL}/file/?src=${encoded}`
      }, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    if (data.status === "picker") {
      const items = data.picker.map(item => ({
        type: item.type,
        url: item.url,
        proxy: `${BASE_URL}/file/?src=${encodeURIComponent(item.url)}`
      }));
      return Response.json({
        status: "success",
        type: "picker",
        items
      }, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    return Response.json({ error: "Response tidak dikenali dari Cobalt", raw: data }, { status: 502 });

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
