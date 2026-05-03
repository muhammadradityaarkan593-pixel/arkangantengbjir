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
      body: "url=" + encodeURIComponent(link)
    });

    const data = await api.json();

    return json({ status: "debug", raw: data });

  } catch (err) {
    return json({
      status: false,
      message: err.message || "Unknown error"
    }, 500);
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
}    });

  } catch (err) {
    return json({
      status: false,
      message: err.message || "Unknown error"
    }, 500);
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
}    const audioUrl = host + "/file/audio.mp3?src=" + encodeURIComponent(resData.music || "");

    const finalResult = {
      title: resData.title || "-",
      username: resData.author?.unique_id || "-",
      thumbnail: resData.cover || "-",
      download: {
        video: videoUrl,
        audio: audioUrl
      }
    };

    return json({
      status: true,
      creator: "Arkan Hosting",
      result: finalResult
    });

  } catch (err) {
    return json({
      status: false,
      message: err.message || "Unknown error"
    }, 500);
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
      result: {
        title: data.data.title ?? "-",
        username: data.data.author?.unique_id ?? "-",
        thumbnail: data.data.cover ?? "-",
        download: {
          video: `${host}/file/video.mp4?src=${encodeURIComponent(data.data.play ?? "")}`,
          audio: `${host}/file/audio.mp3?src=${encodeURIComponent(data.data.music ?? "")}`
        }
      }
    });

  } catch (err) {
    return json({
      status: false,
      message: err.message || "Unknown error"
    }, 500);
  }
}

// Fungsi helper untuk response JSON
function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*" // Tambahan agar bisa diakses dari frontend mana saja
    }
  });
}
        title: data.data.title || "-",
        username: (data.data.author && data.data.author.unique_id) || "-",
        thumbnail: data.data.cover || "-",
        download: {
          video: host + "/file/video.mp4?src=" + encodeURIComponent(data.data.play || ""),
          audio: host + "/file/audio.mp3?src=" + encodeURIComponent(data.data.music || "")
        }
      }
    });

  } catch (err) {
    return json({
      status: false,
      message: err.message || "Unknown error"
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
}        title: data.data.title || "-",
        username: (data.data.author && data.data.author.unique_id) || "-",
        thumbnail: data.data.cover || "-",
        download: {
          video: host + "/file/video.mp4?src=" + encodeURIComponent(data.data.play || ""),
          audio: host + "/file/audio.mp3?src=" + encodeURIComponent(data.data.music || "")
        }
      }
    });

  } catch (err) {
    return json({
      status: false,
      message: err.message || "Unknown error"
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
}        }
      }
    });

  } catch (err) {
    return json({ status: false, message: err.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json" }
  });
}        result: {
          title: data.data.title || "-",
          username: (data.data.author && data.data.author.unique_id) || "-",
          thumbnail: data.data.cover || "-",
          download: {
            video: host + "/file/video.mp4?src=" + encodeURIComponent(data.data.play || ""),
            audio: host + "/file/audio.mp3?src=" + encodeURIComponent(data.data.music || "")
          }
        }
      });

    } catch (err) {
      return json({
        status: false,
        message: (err && err.message) || "Unknown error"
      }, 500);
    }
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status,
    headers: {
      "content-type": "application/json; charset=UTF-8"
    }
  });
}
