 import { Hono } from "hono";
import qs from "qs";

const app = new Hono();

const OK_HEADERS = {
  "User-Agent": "okhttp/4.12.0",
  Host: "app.orderkuota.com",
  "Content-Type": "application/x-www-form-urlencoded",
};

const OK_CONSTANTS = {
  app_reg_id:
    "e5aCENGrQOWvhQWYnv-uNc:APA91bFj3O_mv5Nf_2SM4Duz4Z8Ug3nBNaHlgodlY92CBuNIA9xmc0Dahev5xxqssPmnTdcie4mlhiG9ZAE1iCe1QbyhxcUyGXlenJxiUaXdfm1rklOEo9k",
  phone_uuid: "e5aCENGrQOWvhQWYnv-uNc",
  phone_model: "sdk_gphone64_x86_64",
  phone_android_version: "16",
  app_version_code: "250811",
  app_version_name: "25.08.11",
  ui_mode: "light",
};

app.use("*", async (c, next) => {
  const apiKey = c.req.header("x-api-key") || c.req.query("api_key");
  const validApiKey = c.env.API_KEY || "ARKANGANTENG";

  if (!apiKey || apiKey !== validApiKey) {
    return c.json(
      {
        author: "@Arkanhahaha",
        success: false,
        message: "Unauthorized: Invalid or missing API Key.",
      },
      401
    );
  }
  await next();
});

app.post("/api/otp", async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({
        author: "@Arkanhahaha",
        success: false,
        message: "Username and password are required.",
      });
    }

    const payload = qs.stringify({
      username,
      password,
      ...OK_CONSTANTS,
    });

    const res = await fetch("https://app.orderkuota.com/api/v2/login", {
      method: "POST",
      headers: OK_HEADERS,
      body: payload,
    });

    const data = await res.json();

    if (data?.success === false) {
      return c.json({ author: "@Arkanhahaha", ...data });
    }

    const email = data?.results?.otp_value;

    if (!email) {
      return c.json({
        author: "@Arkanhahaha",
        success: false,
        message: "Failed to get OTP email from response",
      });
    }

    return c.json({
      author: "@Arkanhahaha",
      status: "success",
      email: email,
      message: `OTP has been sent to ${email}. Please check your email.`,
    });
  } catch (err) {
    return c.json({
      author: "@Arkanhahaha",
      success: false,
      message: `Unexpected error: ${err.message}`,
    });
  }
});

app.post("/api/token", async (c) => {
  try {
    const { username, otp } = await c.req.json();

    if (!username || !otp) {
      return c.json({
        author: "@Arkanhahaha",
        success: false,
        message: "Username and OTP are required.",
      });
    }

    const payload = qs.stringify({
      username,
      password: otp,
      ...OK_CONSTANTS,
    });

    const res = await fetch("https://app.orderkuota.com/api/v2/login", {
      method: "POST",
      headers: OK_HEADERS,
      body: payload,
    });

    const data = await res.json();

    if (data?.success === false) {
      return c.json({ author: "@Arkanhahaha", ...data });
    }

    if (!data?.results?.token) {
      return c.json({
        author: "@Arkanhahaha",
        success: false,
        message: "Token not found in response.",
      });
    }

    return c.json({
      author: "@Arkanhahaha",
      status: "success",
      token: data.results.token,
      id: data.results.id,
      name: data.results.name,
      username: data.results.username,
      balance: data.results.balance,
      message: "Token successfully obtained.",
    });
  } catch (err) {
    return c.json({
      author: "@Arkanhahaha",
      success: false,
      message: `Unexpected error: ${err.message}`,
    });
  }
});

app.post("/api/qris-ajaib", async (c) => {
  try {
    const { username, token, amount = 1000 } = await c.req.json();

    if (!username || !token) {
      return c.json({
        author: "@Arkanhahaha",
        success: false,
        message: "Username and token are required.",
      });
    }

    const timestamp = Date.now().toString();
    const payload = qs.stringify({
      ...OK_CONSTANTS,
      auth_username: username,
      auth_token: token,
      request_time: timestamp,
      "requests[qris_ajaib][amount]": amount.toString(),
    });

    // Endpoint resmi QRIS Ajaib
    const res = await fetch("https://app.orderkuota.com/api/v2/get", {
      method: "POST",
      headers: OK_HEADERS,
      body: payload,
    });

    const data = await res.json();
    return c.json({ author: "@Arkanhahaha", ...data });
  } catch (err) {
    return c.json({
      author: "@Arkanhahaha",
      success: false,
      message: `Unexpected error: ${err.message}`,
    });
  }
});

app.post("/api/qris-history", async (c) => {
  try {
    const { username, token, historyType = "qris_history", options = {} } = await c.req.json();

    if (!username || !token) {
      return c.json({
        author: "@Arkanhahaha",
        success: false,
        message: "Username and token are required.",
      });
    }

    const timestamp = Date.now().toString();
    const tokenId = token.split(":")[0];

    const payload = {
      app_reg_id: OK_CONSTANTS.app_reg_id,
      phone_uuid: OK_CONSTANTS.phone_uuid,
      phone_model: OK_CONSTANTS.phone_model,
      [`requests[${historyType}][keterangan]`]: options.keterangan || "",
      [`requests[${historyType}][jumlah]`]: options.jumlah || "",
      request_time: timestamp,
      phone_android_version: OK_CONSTANTS.phone_android_version,
      app_version_code: OK_CONSTANTS.app_version_code,
      auth_username: username,
      [`requests[${historyType}][page]`]: options.page || "1",
      auth_token: token,
      app_version_name: OK_CONSTANTS.app_version_name,
      ui_mode: OK_CONSTANTS.ui_mode,
      [`requests[${historyType}][dari_tanggal]`]: options.dari_tanggal || "",
      "requests[0]": "account",
      [`requests[${historyType}][ke_tanggal]`]: options.ke_tanggal || "",
    };

    const res = await fetch(
      `https://app.orderkuota.com/api/v2/qris/mutasi/${tokenId}`,
      {
        method: "POST",
        headers: OK_HEADERS,
        body: qs.stringify(payload),
      }
    );

    const data = await res.json();
    return c.json({ author: "@Arkanhahaha", ...data });
  } catch (err) {
    return c.json({
      author: "@Arkanhahaha",
      success: false,
      message: `Unexpected error: ${err.message}`,
    });
  }
});

export default app;
