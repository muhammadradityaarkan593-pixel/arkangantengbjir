export async function handleTikTok(request) {
  const reqUrl = new URL(request.url);
  const link = reqUrl.searchParams.get("url");

  if (!link) {
    return json({
      status: false,
      message: "Masukkan parameter url"
    }, 400);
  }

  try {
    const api = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent": "Mozilla/5.0"
      },
      body: `url=${encodeURIComponent(link)}`
    });

    const data = await api.json();

    // VALIDASI RESPONSE
    if (!data || !data.data) {
      return json({
        status: false,
        message: "Video tidak ditemukan / API sedang error"
      }, 500);
    }

    const host = reqUrl.origin;

    return json({
      status: true,
      creator: "Arkan Hosting",
      result: {
        title: data.data.title || "-",
        username: data.data.author?.unique_id || "-",
        thumbnail: data.data.cover || "-",
        download: {
          video: `${host}/file/video.mp4?src=${encodeURIComponent(data.data.play)}`,
          audio: `${host}/file/audio.mp3?src=${encodeURIComponent(data.data.music)}`
        }
      }
    });

  } catch (err) {
    return json({
      status: false,
      message: err.message
    }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8"
    }
  });
}    });

  } catch (err) {
    return json({
      status: false,
      message: err.message
    }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8"
    }
  });
}
