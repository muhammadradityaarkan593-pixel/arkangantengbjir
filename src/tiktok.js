export async function handleTikTok(request) {
  const reqUrl = new URL(request.url);
  const link = reqUrl.searchParams.get("url");

  if (!link) {
    return json({ status: false, message: "Masukkan parameter url" }, 400);
  }

  try {
    const api = await fetch("https://api.tikmate.app/api/lookup", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "Mozilla/5.0"
      },
      body: "url=" + encodeURIComponent(link)
    });

    const data = await api.json();

    if (!data || !data.token) {
      return json({ status: false, message: "Video tidak ditemukan / API error", raw: data }, 500);
    }

    const host = reqUrl.origin;
    const videoUrl = host + "/file/video.mp4?src=" + encodeURIComponent(
      "https://tikmate.app/download/" + data.token + "/" + data.id + ".mp4"
    );
    const audioUrl = host + "/file/audio.mp3?src=" + encodeURIComponent(
      "https://tikmate.app/download/" + data.token + "/" + data.id + ".mp3"
    );

    return json({
      status: true,
      creator: "Arkan Hosting",
      result: {
        title: data.desc || "-",
        username: data.author_name || "-",
        thumbnail: data.cover || "-",
        download: {
          video: videoUrl,
          audio: audioUrl
        }
      }
    });

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
