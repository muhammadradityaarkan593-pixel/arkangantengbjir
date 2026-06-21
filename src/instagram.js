 // ============================================================
// AUTH.JS - API Key & Rate Limit Management
// ============================================================

/**
 * Validasi API Key dari KV Storage
 * @param {string} apiKey - API key yang dikirim user
 * @param {object} env - Environment variable dari Worker
 * @returns {Promise<boolean>} - true jika valid, false jika tidak
 */
export async function validateApiKey(apiKey, env) {
  if (!apiKey) return false;
  
  // Cek di KV: key = "api_key:xxx", value = "true"
  const stored = await env.KV.get(`api_key:${apiKey}`);
  return stored === 'true';
}

/**
 * Cek rate limit per API key (sliding window)
 * @param {string} apiKey - API key yang dicek
 * @param {object} env - Environment variable dari Worker
 * @returns {Promise<object>} - { allowed, limit, remaining, resetAt }
 */
export async function checkRateLimit(apiKey, env) {
  const key = `ratelimit:${apiKey}`;
  const now = Date.now();
  const windowMs = 60000; // 1 menit
  const limit = 200; // Maksimal 200 request per menit

  // Ambil data rate limit dari KV
  const data = await env.KV.get(key, 'json');
  let requests = [];
  let resetAt = new Date(now + windowMs).toISOString();

  // Filter request yang masih dalam window 1 menit
  if (data && data.requests) {
    requests = data.requests.filter(timestamp => now - timestamp < windowMs);
  }

  // Cek apakah udah mencapai limit
  if (requests.length >= limit) {
    return { 
      allowed: false, 
      limit, 
      remaining: 0, 
      resetAt 
    };
  }

  // Tambah request baru ke daftar
  requests.push(now);
  await env.KV.put(key, JSON.stringify({ requests }), { expirationTtl: 120 });

  return {
    allowed: true,
    limit,
    remaining: limit - requests.length,
    resetAt
  };
}

/**
 * Generate API key baru (random)
 * @returns {string} - API key format: ak-xxxxxxxxxxxxxxxx
 */
export function generateApiKey() {
  const random = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  return `ak-${random}`;
}

/**
 * Simpan API key ke KV
 * @param {string} apiKey - API key yang akan disimpan
 * @param {object} env - Environment variable dari Worker
 * @param {string} [label] - Label opsional untuk key (misal: "user-1")
 */
export async function saveApiKey(apiKey, env, label = '') {
  const meta = {
    created_at: new Date().toISOString(),
    label: label || 'unnamed',
    last_used: null
  };
  
  await env.KV.put(`api_key:${apiKey}`, 'true');
  await env.KV.put(`api_key_meta:${apiKey}`, JSON.stringify(meta));
  
  return apiKey;
}

/**
 * Hapus API key dari KV
 * @param {string} apiKey - API key yang akan dihapus
 * @param {object} env - Environment variable dari Worker
 */
export async function deleteApiKey(apiKey, env) {
  await env.KV.delete(`api_key:${apiKey}`);
  await env.KV.delete(`api_key_meta:${apiKey}`);
  await env.KV.delete(`ratelimit:${apiKey}`);
}

/**
 * List semua API key (dengan metadata)
 * @param {object} env - Environment variable dari Worker
 * @returns {Promise<Array>} - Array of { key, meta }
 */
export async function listApiKeys(env) {
  const keys = await env.KV.list({ prefix: 'api_key:' });
  const result = [];
  
  for (const key of keys.keys) {
    const apiKey = key.name.replace('api_key:', '');
    const metaRaw = await env.KV.get(`api_key_meta:${apiKey}`, 'json');
    result.push({
      key: apiKey,
      meta: metaRaw || { label: 'unknown' }
    });
  }
  
  return result;
}

/**
 * Update last_used timestamp untuk API key
 * @param {string} apiKey - API key yang dipakai
 * @param {object} env - Environment variable dari Worker
 */
export async function updateLastUsed(apiKey, env) {
  const metaRaw = await env.KV.get(`api_key_meta:${apiKey}`, 'json');
  if (metaRaw) {
    metaRaw.last_used = new Date().toISOString();
    await env.KV.put(`api_key_meta:${apiKey}`, JSON.stringify(metaRaw));
  }
}
