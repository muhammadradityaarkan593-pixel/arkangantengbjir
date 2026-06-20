import { handleDashboard } from './dashboard';
import { handleDocs } from './docs';
import { validateApiKey, checkRateLimit } from './auth';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ============ DASHBOARD ============
    if (path === '/dashboard' || path === '/') {
      return handleDashboard(env);
    }

    // ============ DOKUMENTASI ============
    if (path === '/docs') {
      return handleDocs();
    }

    // ============ CHAT API ============
    if (path === '/chat' && request.method === 'POST') {
      // 1. Validasi API Key
      const apiKey = request.headers.get('x-api-key');
      if (!apiKey) {
        return jsonResponse({ 
          ok: false, 
          error: 'API key required. Send x-api-key header' 
        }, 401);
      }

      const valid = await validateApiKey(apiKey, env);
      if (!valid) {
        return jsonResponse({ 
          ok: false, 
          error: 'Invalid API key' 
        }, 403);
      }

      // 2. Check rate limit
      const rateLimit = await checkRateLimit(apiKey, env);
      if (!rateLimit.allowed) {
        return jsonResponse({ 
          ok: false, 
          error: 'Rate limit exceeded. Try again later.',
          reset_at: rateLimit.resetAt,
          limit: rateLimit.limit
        }, 429);
      }

      // 3. Proses prompt
      try {
        const { prompt } = await request.json();
        if (!prompt) {
          return jsonResponse({ 
            ok: false, 
            error: 'Field "prompt" required' 
          }, 400);
        }

        const response = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
          messages: [{ role: 'user', content: prompt }]
        });

        // 4. Kirim hasil + sisa kuota
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
          error: error.message 
        }, 500);
      }
    }

    // ============ 404 ============
    return jsonResponse({ 
      ok: false, 
      error: 'Endpoint not found' 
    }, 404);
  }
};

// Helper function buat JSON response
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
