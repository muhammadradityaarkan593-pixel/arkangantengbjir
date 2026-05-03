export async function handleTikTok(request) {
  const reqUrl = new URL(request.url);
  const link = reqUrl.searchParams.get("url");

  if (!link) {
    return json({ status: false, message: "Masukkan parameter url" }, 400);
  }

  try {
    const api = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent": "Mozilla/5.0"
      },
      body: "url=" + encodeURIComponent(link)
    });

    const data = await api.json();
    return json({ status: "debug", raw: data });

  } catch (err) {
    return json({ status: false, message: err.message || "Unknown error" }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
