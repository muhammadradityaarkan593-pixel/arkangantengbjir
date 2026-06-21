export function handleDocs() {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>API Documentation - AI Platform</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0b0b12;
      color: #e4e4e7;
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    a {
      color: #f97316;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2.5rem;
      border-bottom: 1px solid #27272a;
      padding-bottom: 1.5rem;
    }
    .header h1 {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #f97316, #fb923c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .badge {
      background: #27272a;
      padding: 0.3rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      border: 1px solid #3f3f46;
    }
    .badge span {
      color: #4ade80;
      font-weight: 600;
    }
    .card {
      background: #18181b;
      border-radius: 16px;
      padding: 1.8rem;
      margin-bottom: 2rem;
      border: 1px solid #27272a;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .card h2 {
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #f97316;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .card h2 .emoji {
      font-size: 1.6rem;
    }
    .card p,
    .card li {
      color: #a1a1aa;
    }
    .card code {
      background: #27272a;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #fbbf24;
    }
    .card pre {
      background: #0b0b12;
      padding: 1rem;
      border-radius: 10px;
      overflow-x: auto;
      font-size: 0.9rem;
      border-left: 4px solid #f97316;
      margin: 1rem 0;
    }
    .card pre code {
      background: transparent;
      padding: 0;
      color: #d4d4d8;
    }
    .demo-group {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin: 1.2rem 0;
    }
    .demo-group label {
      font-weight: 500;
      color: #d4d4d8;
    }
    .demo-group input,
    .demo-group select,
    .demo-group textarea {
      background: #0b0b12;
      border: 1px solid #3f3f46;
      border-radius: 10px;
      padding: 0.8rem 1rem;
      color: #e4e4e7;
      font-size: 0.95rem;
      transition: border 0.2s;
    }
    .demo-group input:focus,
    .demo-group select:focus,
    .demo-group textarea:focus {
      outline: none;
      border-color: #f97316;
    }
    .demo-group textarea {
      min-height: 80px;
      resize: vertical;
      font-family: inherit;
    }
    .demo-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .demo-row .demo-group {
      flex: 1;
      min-width: 200px;
    }
    .btn {
      background: #f97316;
      border: none;
      color: #fff;
      font-weight: 600;
      padding: 0.8rem 2rem;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      font-size: 1rem;
      align-self: flex-start;
    }
    .btn:hover {
      background: #ea580c;
    }
    .btn:active {
      transform: scale(0.97);
    }
    .btn-secondary {
      background: #3f3f46;
    }
    .btn-secondary:hover {
      background: #52525b;
    }
    .response-box {
      background: #0b0b12;
      border-radius: 10px;
      padding: 1.2rem;
      margin-top: 1.2rem;
      border: 1px solid #3f3f46;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 400px;
      overflow-y: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      color: #d4d4d8;
    }
    .response-box .label {
      color: #71717a;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
      display: block;
    }
    .response-box .ok-true {
      color: #4ade80;
    }
    .response-box .ok-false {
      color: #f87171;
    }
    .footer {
      margin-top: 3rem;
      text-align: center;
      color: #52525b;
      font-size: 0.9rem;
      border-top: 1px solid #27272a;
      padding-top: 2rem;
    }
    @media (max-width: 640px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
      }
      .demo-row {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>📖 API Documentation</h1>
    <div class="badge">⚡ Status: <span>Online</span></div>
  </div>

  <div class="card">
    <h2><span class="emoji">🔗</span> Endpoint</h2>
    <p><strong>POST</strong> <code id="endpointUrl">/chat</code></p>
    <p>Base URL: <span id="baseUrlDisplay">/</span></p>
  </div>

  <div class="card">
    <h2><span class="emoji">🔑</span> Authentication</h2>
    <p>Kirim <code>x-api-key</code> header dengan API key kamu.</p>
    <pre><code>x-api-key: ak-xxxxxxxxxxxxxxxx</code></pre>
    <p>Dapatkan API key di <a href="/dashboard">Dashboard</a> atau via <code>/generate-key</code>.</p>
  </div>

  <div class="card">
    <h2><span class="emoji">📦</span> Request &amp; Response</h2>
    <p><strong>Body (JSON):</strong></p>
    <pre><code>{
  "prompt": "Tulis puisi tentang coding",
  "model": "@cf/meta/llama-3.2-3b-instruct"
}</code></pre>
    <p><strong>Response Sukses (ok: true):</strong></p>
    <pre><code>{
  "ok": true,
  "result": { "response": "..." },
  "usage": {
    "remaining": 195,
    "limit": 200,
    "reset_at": "2026-06-21T12:00:00.000Z"
  }
}</code></pre>
    <p><strong>Response Error (ok: false):</strong></p>
    <pre><code>{
  "ok": false,
  "error": "Rate limit exceeded. Try again later.",
  "reset_at": "2026-06-21T12:00:00.000Z",
  "limit": 200
}</code></pre>
  </div>

  <div class="card">
    <h2><span class="emoji">🧪</span> Live Demo</h2>
    <p>Coba kirim prompt langsung ke API di bawah ini.</p>
    <div class="demo-group">
      <label for="apiKeyInput">🔑 API Key</label>
      <input type="text" id="apiKeyInput" placeholder="Masukkan API key kamu" value="ak-xxxxxxxxxxxxxxxx" />
    </div>
    <div class="demo-row">
      <div class="demo-group">
        <label for="promptInput">💬 Prompt</label>
        <textarea id="promptInput" placeholder="Tanyakan apa saja...">Ceritakan tentang Cloudflare Workers AI dalam 3 kalimat!</textarea>
      </div>
      <div class="demo-group" style="flex: 0 0 200px;">
        <label for="modelSelect">🤖 Model</label>
        <select id="modelSelect">
          <option value="@cf/meta/llama-3.2-3b-instruct" selected>Llama 3.2 3B</option>
          <option value="@cf/qwen/qwen1.5-0.5b-chat">Qwen 0.5B</option>
          <option value="@cf/meta/llama-3.1-8b-instruct">Llama 3.1 8B</option>
        </select>
      </div>
    </div>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem;">
      <button class="btn" id="sendBtn">🚀 Kirim</button>
      <button class="btn btn-secondary" id="clearBtn">🗑️ Clear</button>
    </div>
    <div class="response-box" id="responseBox">
      <span class="label">📨 Response akan muncul di sini</span>
    </div>
  </div>

  <div class="card">
    <h2><span class="emoji">🖥️</span> Contoh cURL</h2>
    <pre><code id="curlExample">curl -X POST /chat \\\n  -H "x-api-key: ak-xxxxxxxxxxxxxxxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"prompt": "Halo, siapa kamu?"}'</code></pre>
    <button class="btn btn-secondary" id="copyCurlBtn">📋 Salin cURL</button>
  </div>

  <div class="footer">
    &copy; 2026 AI Platform — Dibangun dengan ❤️ di atas Cloudflare Workers
  </div>
</div>

<script>
  (function() {
    const baseUrl = window.location.origin;
    document.getElementById('endpointUrl').textContent = baseUrl + '/chat';
    document.getElementById('baseUrlDisplay').textContent = baseUrl;
    document.getElementById('curlExample').textContent =
      'curl -X POST ' + baseUrl + '/chat \\\n  -H "x-api-key: ak-xxxxxxxxxxxxxxxx" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"prompt": "Halo, siapa kamu?"}\'';

    const apiKeyInput = document.getElementById('apiKeyInput');
    const promptInput = document.getElementById('promptInput');
    const modelSelect = document.getElementById('modelSelect');
    const sendBtn = document.getElementById('sendBtn');
    const clearBtn = document.getElementById('clearBtn');
    const responseBox = document.getElementById('responseBox');
    const copyCurlBtn = document.getElementById('copyCurlBtn');

    async function sendRequest() {
      const apiKey = apiKeyInput.value.trim();
      const prompt = promptInput.value.trim();
      const model = modelSelect.value;

      if (!apiKey) {
        responseBox.innerHTML = '<span class="label">❌ Error</span>\\n' + JSON.stringify({ ok: false, error: 'API key wajib diisi' }, null, 2);
        return;
      }
      if (!prompt) {
        responseBox.innerHTML = '<span class="label">❌ Error</span>\\n' + JSON.stringify({ ok: false, error: 'Prompt tidak boleh kosong' }, null, 2);
        return;
      }

      responseBox.innerHTML = '<span class="label">⏳ Mengirim...</span>';

      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({ prompt, model })
        });

        const data = await response.json();
        const pretty = JSON.stringify(data, null, 2);
        const okStatus = data.ok === true ? 'ok-true' : 'ok-false';
        responseBox.innerHTML = '<span class="label">📨 Response (' + response.status + ')</span>\\n<span class="' + okStatus + '">' + pretty + '</span>';
      } catch (err) {
        responseBox.innerHTML = '<span class="label">❌ Network Error</span>\\n' + err.message;
      }
    }

    sendBtn.addEventListener('click', sendRequest);
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        sendRequest();
      }
    });
    clearBtn.addEventListener('click', () => {
      promptInput.value = '';
      responseBox.innerHTML = '<span class="label">📨 Response akan muncul di sini</span>';
    });
    copyCurlBtn.addEventListener('click', () => {
      const curlText = document.getElementById('curlExample').textContent;
      navigator.clipboard.writeText(curlText).then(() => {
        const original = copyCurlBtn.textContent;
        copyCurlBtn.textContent = '✅ Tersalin!';
        setTimeout(() => { copyCurlBtn.textContent = original; }, 2000);
      }).catch(() => alert('Gagal menyalin, silakan salin manual.'));
    });

    const urlParams = new URLSearchParams(window.location.search);
    const keyParam = urlParams.get('api_key');
    if (keyParam) {
      apiKeyInput.value = keyParam;
    }
  })();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
