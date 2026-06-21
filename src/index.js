// ============================================================
// INDEX.JS - Main Entry (Semua Endpoint)
// ============================================================

import { handleDashboard } from './dashboard';
import { handleDocs } from './docs';
import {
  validateApiKey,
  checkRateLimit,
  generateApiKey,
  saveApiKey,
  deleteApiKey,
  listApiKeys,
  updateLastUsed
} from './auth';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // ============ ROUTES ============
    
    // Dashboard
    if (path === '/' || path === '/dashboard') {
      return handleDashboard(env);
    }

    // Dokumentasi
    if (path === '/docs') {
      return handleDocs();
    }

    // Generate API Key
    if (path === '/generate-key' && method === 'POST') {
      return await handleGenerateKey(request, env);
    }

    // List API Keys
    if (path === '/list-keys' && method === 'GET') {
      return await handleListKeys(request, env);
    }

    // Delete API Key
    if (path === '/delete-key' && method === 'POST') {
      return await handleDeleteKey(request, env);
    }

    // Cek Quota
    if (path === '/quota' && method === 'GET') {
      return await handleQuota(request, env);
    }

    // Chat AI
    if (path === '/chat' && method === 'POST') {
      return await handleChat(request, env);
    }

    // 404
    return jsonResponse({ ok: false, error: 'Endpoint tidak ditemukan' }, 404);
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, x-admin-secret'
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}

// ============================================================
// HANDLERS
// ============================================================

// GENERATE KEY
async function handleGenerateKey(request, env) {
  const adminSecret = request.headers.get('x-admin-secret');
  if (adminSecret !== 'rahasiabanget') {
    return jsonResponse({ ok: false, error: 'Unauthorized' }, 403);
  }

  let label = '';
  try {
    const body = await request.json();
    label = body.label || '';
  } catch (_) {}

  const newKey = generateApiKey();
  await saveApiKey(newKey, env, label);

  return jsonResponse({
    ok: true,
    api_key: newKey,
    message: 'Simpan API key ini! Tidak akan ditampilkan lagi.'
  });
}

// LIST KEYS
async function handleListKeys(request, env) {
  const adminSecret = request.headers.get('x-admin-secret');
  if (adminSecret !== 'rahasiabanget') {
    return jsonResponse({ ok: false, error: 'Unauthorized' }, 403);
  }

  const keys = await listApiKeys(env);
  return jsonResponse({ ok: true, keys });
}

// DELETE KEY
async function handleDeleteKey(request, env) {
  const adminSecret = request.headers.get('x-admin-secret');
  if (adminSecret !== 'rahasiabanget') {
    return jsonResponse({ ok: false, error: 'Unauthorized' }, 403);
  }

  let apiKey;
  try {
    const body = await request.json();
    apiKey = body.api_key;
  } catch (_) {
    return jsonResponse({ ok: false, error: 'Body harus JSON dengan field "api_key"' }, 400);
  }

  if (!apiKey) {
    return jsonResponse({ ok: false, error: 'Field "api_key" required' }, 400);
  }

  await deleteApiKey(apiKey, env);
  return jsonResponse({ ok: true, message: 'API key berhasil dihapus' });
}

// QUOTA
async function handleQuota(request, env) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return jsonResponse({ ok: false, error: 'API key required' }, 401);
  }

  const valid = await validateApiKey(apiKey, env);
  if (!valid) {
    return jsonResponse({ ok: false, error: 'Invalid API key' }, 403);
  }

  const rateLimit = await checkRateLimit(apiKey, env);
  return jsonResponse({
    ok: true,
    quota: {
      remaining: rateLimit.remaining,
      limit: rateLimit.limit,
      reset_at: rateLimit.resetAt
    }
  });
}

// CHAT
async function handleChat(request, env) {
  // 1. Validasi API Key
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return jsonResponse({ ok: false, error: 'API key required' }, 401);
  }

  const valid = await validateApiKey(apiKey, env);
  if (!valid) {
    return jsonResponse({ ok: false, error: 'Invalid API key' }, 403);
  }

  // 2. Rate limit
  const rateLimit = await checkRateLimit(apiKey, env);
  if (!rateLimit.allowed) {
    return jsonResponse({
      ok: false,
      error: 'Rate limit exceeded. Coba lagi nanti.',
      reset_at: rateLimit.resetAt,
      limit: rateLimit.limit
    }, 429);
  }

  // 3. Parse body
  let prompt, model;
  try {
    const body = await request.json();
    prompt = body.prompt;
    model = body.model || '@cf/meta/llama-3.2-3b-instruct';
  } catch (_) {
    return jsonResponse({ ok: false, error: 'Body harus JSON dengan field "prompt"' }, 400);
  }

  if (!prompt) {
    return jsonResponse({ ok: false, error: 'Field "prompt" required' }, 400);
  }

  // 4. Panggil Workers AI
  try {
    const response = await env.AI.run(model, {
      messages: [{ role: 'user', content: prompt }]
    });

    await updateLastUsed(apiKey, env);

    return jsonResponse({
      ok: true,
      result: response,
      usage: {
        remaining: rateLimit.remaining,
        limit: rateLimit.limit,
        reset_at: rateLimit.resetAt
      }
    });

  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error.message || 'Terjadi kesalahan pada AI'
    }, 500);
  }
}
