 // ============================================================
// DASHBOARD.JS - Halaman Dashboard AI Platform
// ============================================================

export function handleDashboard(env) {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard - AI Platform</title>
  <style>
    /* ---------- RESET & GLOBAL ---------- */
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
      max-width: 1100px;
      margin: 0 auto;
    }
    a {
      color: #f97316;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }

    /* ---------- HEADER ---------- */
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
    .header-actions {
      display: flex;
      gap: 0.8rem;
      flex-wrap: wrap;
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
    .badge-warning span {
      color: #fbbf24;
    }

    /* ---------- CARD ---------- */
    .card {
      background: #18181b;
      border-radius: 16px;
      padding: 1.8rem;
      margin-bottom: 2rem;
      border: 1px solid #27272a;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .card h2 {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 1.2rem;
      color: #f97316;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .card h2 .emoji {
      font-size: 1.5rem;
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

    /* ---------- STATS GRID ---------- */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    .stat-card {
      background: #0b0b12;
      padding: 1.2rem;
      border-radius: 12px;
      border: 1px solid #27272a;
      text-align: center;
    }
    .stat-card .number {
      font-size: 2rem;
      font-weight: 700;
      color: #f97316;
      display: block;
    }
    .stat-card .label {
      font-size: 0.8rem;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-card .number.green {
      color: #4ade80;
    }
    .stat-card .number.yellow {
      color: #fbbf24;
    }
    .stat-card .number.red {
      color: #f87171;
    }

    /* ---------- FORM ---------- */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 1rem 0;
    }
    .form-group label {
      font-weight: 500;
      color: #d4d4d8;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      background: #0b0b12;
      border: 1px solid #3f3f46;
      border-radius: 10px;
      padding: 0.8rem 1rem;
      color: #e4e4e7;
      font-size: 0.95rem;
      transition: border 0.2s;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #f97316;
    }
    .form-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .form-row .form-group {
      flex: 1;
      min-width: 200px;
    }

    /* ---------- BUTTONS ---------- */
    .btn {
      background: #f97316;
      border: none;
      color: #fff;
      font-weight: 600;
      padding: 0.7rem 1.5rem;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      font-size: 0.95rem;
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
    .btn-danger {
      background: #dc2626;
    }
    .btn-danger:hover {
      background: #b91c1c;
    }
    .btn-success {
      background: #16a34a;
    }
    .btn-success:hover {
      background: #15803d;
    }
    .btn-sm {
      padding: 0.4rem 1rem;
      font-size: 0.8rem;
    }

    /* ---------- TABLE ---------- */
    .table-wrap {
      overflow-x: auto;
      margin: 1rem 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    th {
      text-align: left;
      padding: 0.8rem 0.5rem;
      color: #71717a;
      border-bottom: 1px solid #27272a;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }
    td {
      padding: 0.8rem 0.5rem;
      border-bottom: 1px solid #1f1f23;
      color: #d4d4d8;
    }
    td .key {
      font-family: monospace;
      background: #27272a;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .text-muted {
      color: #71717a;
      font-size: 0.85rem;
    }
    .text-success {
      color: #4ade80;
    }
    .text-danger {
      color: #f87171;
    }

    /* ---------- ALERT ---------- */
    .alert {
      padding: 1rem;
      border-radius: 10px;
      margin: 1rem 0;
      border-left: 4px solid;
    }
    .alert-success {
      background: #052e16;
      border-color: #16a34a;
      color: #86efac;
    }
    .alert-error {
      background: #2e0505;
      border-color: #dc2626;
      color: #fca5a5;
    }
    .alert-info {
      background: #05203e;
      border-color: #2563eb;
      color: #93c5fd;
    }

    /* ---------- FOOTER ---------- */
    .footer {
      margin-top: 3rem;
      text-align: center;
      color: #52525b;
      font-size: 0.9rem;
      border-top: 1px solid #27272a;
      padding-top: 2rem;
    }

    /* ---------- RESPONSIVE ---------- */
    @media (max-width: 640px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
      }
      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }
      .form-row {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>

<div class="container">
  <!-- HEADER -->
  <div class="header">
    <h1>🚀 AI Platform Dashboard</h1>
    <div class="header-actions">
      <div class="badge">⚡ Status: <span>Online</span></div>
      <div class="badge badge-warning">🔄 Rate Limit: <span>200/menit</span></div>
      <a href="/docs" class="btn btn-secondary btn-sm">📖 Docs</a>
    </div>
  </div>

  <!-- STATS -->
  <div class="card">
    <h2><span class="emoji">📊</span> Statistik Platform</h2>
    <div class="stats-grid" id="statsGrid">
      <div class="stat-card">
        <span class="number" id="totalKeys">0</span>
        <span class="label">Total API Key</span>
      </div>
      <div class="stat-card">
        <span class="number green" id="activeKeys">0</span>
        <span class="label">Aktif</span>
      </div>
      <div class="stat-card">
        <span class="number yellow" id="modelUsed">Llama 3.2</span>
        <span class="label">Model Default</span>
      </div>
      <div class="stat-card">
        <span class="number" id="rateLimitDisplay">200</span>
        <span class="label">Rate Limit (req/menit)</span>
      </div>
    </div>
  </div>

  <!-- GENERATE API KEY -->
  <div class="card">
    <h2><span class="emoji">🔑</span> Generate API Key Baru</h2>
    <p>Buat API key baru untuk mengakses API. <strong>Simpan segera!</strong> Key hanya ditampilkan sekali.</p>
    
    <div class="form-row">
      <div class="form-group">
        <label for="keyLabel">Label (opsional)</label>
        <input type="text" id="keyLabel" placeholder="Misal: bot-telegram" />
      </div>
      <div class="form-group" style="flex: 0 0 200px;">
        <label>&nbsp;</label>
        <button class="btn" id="generateBtn">✨ Generate Key</button>
      </div>
    </div>
    <div id="generateResult"></div>
  </div>

  <!-- LIST API KEYS -->
  <div class="card">
    <h2><span class="emoji">📋</span> Daftar API Key</h2>
    <p>Semua API key yang terdaftar di platform ini.</p>
    
    <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; margin: 1rem 0;">
      <button class="btn btn-secondary btn-sm" id="refreshBtn">🔄 Refresh</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>API Key</th>
            <th>Label</th>
            <th>Dibuat</th>
            <th>Terakhir Dipakai</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="keysTableBody">
          <tr>
            <td colspan="5" class="text-muted" style="text-align: center;">Loading...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- QUICK INFO -->
  <div class="card">
    <h2><span class="emoji">ℹ️</span> Cara Pakai</h2>
    <ol style="padding-left: 1.5rem; color: #a1a1aa;">
      <li>Generate API key di atas</li>
      <li>Kirim POST request ke <code>/chat</code> dengan header <code>x-api-key: your-key</code></li>
      <li>Body JSON: <code>{"prompt": "Halo!"}</code></li>
      <li>Lihat <a href="/docs">Dokumentasi Lengkap</a> untuk detail</li>
    </ol>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    &copy; 2026 AI Platform — Dibangun dengan ❤️ di atas Cloudflare Workers
  </div>
</div>

<script>
  (function() {
    // ---------- Konfig ----------
    const ADMIN_SECRET = 'rahasiabanget'; // Ganti dengan secret-mu

    // ---------- DOM refs ----------
    const generateBtn = document.getElementById('generateBtn');
    const keyLabel = document.getElementById('keyLabel');
    const generateResult = document.getElementById('generateResult');
    const keysTableBody = document.getElementById('keysTableBody');
    const refreshBtn = document.getElementById('refreshBtn');
    const totalKeysEl = document.getElementById('totalKeys');

    // ---------- Format tanggal ----------
    function formatDate(dateStr) {
      if (!dateStr) return 'Belum dipakai';
      const d = new Date(dateStr);
      return d.toLocaleString('id-ID', { 
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      });
    }

    // ---------- Load daftar API key ----------
    async function loadKeys() {
      try {
        const response = await fetch('/list-keys', {
          headers: { 'x-admin-secret': ADMIN_SECRET }
        });
        const data = await response.json();

        if (!data.ok) {
          keysTableBody.innerHTML = \`<tr><td colspan="5" class="text-danger" style="text-align: center;">❌ \${data.error || 'Gagal load data'}</td></tr>\`;
          return;
        }

        const keys = data.keys || [];
        totalKeysEl.textContent = keys.length;

        if (keys.length === 0) {
          keysTableBody.innerHTML = \`<tr><td colspan="5" class="text-muted" style="text-align: center;">Belum ada API key. Generate yang pertama!</td></tr>\`;
          return;
        }

        let html = '';
        keys.forEach(item => {
          const meta = item.meta || {};
          html += \`
            <tr>
              <td><span class="key">\${item.key}</span></td>
              <td>\${meta.label || '-'}</td>
              <td>\${formatDate(meta.created_at)}</td>
              <td>\${formatDate(meta.last_used)}</td>
              <td>
                <button class="btn btn-danger btn-sm delete-btn" data-key="\${item.key}">🗑️</button>
                <button class="btn btn-secondary btn-sm copy-btn" data-key="\${item.key}">📋</button>
              </td>
            </tr>
          \`;
        });
        keysTableBody.innerHTML = html;

        // Event listener delete
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const key = btn.dataset.key;
            if (!confirm(\`Hapus API key "\${key}"? Ini permanen!\`)) return;
            
            try {
              const res = await fetch('/delete-key', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-admin-secret': ADMIN_SECRET
                },
                body: JSON.stringify({ api_key: key })
              });
              const result = await res.json();
              if (result.ok) {
                loadKeys();
              } else {
                alert('Gagal hapus: ' + result.error);
              }
            } catch (err) {
              alert('Error: ' + err.message);
            }
          });
        });

        // Event listener copy
        document.querySelectorAll('.copy-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            navigator.clipboard.writeText(key).then(() => {
              const original = btn.textContent;
              btn.textContent = '✅';
              setTimeout(() => { btn.textContent = original; }, 1500);
            }).catch(() => alert('Gagal copy'));
          });
        });

      } catch (err) {
        keysTableBody.innerHTML = \`<tr><td colspan="5" class="text-danger" style="text-align: center;">❌ Error: \${err.message}</td></tr>\`;
      }
    }

    // ---------- Generate API Key ----------
    generateBtn.addEventListener('click', async () => {
      const label = keyLabel.value.trim() || 'User';
      generateResult.innerHTML = '<span class="text-muted">⏳ Generating...</span>';

      try {
        const response = await fetch('/generate-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': ADMIN_SECRET
          },
          body: JSON.stringify({ label })
        });
        const data = await response.json();

        if (data.ok) {
          generateResult.innerHTML = \`
            <div class="alert alert-success">
              ✅ <strong>API Key berhasil dibuat!</strong><br />
              <code style="font-size: 1.1rem; display: block; margin: 0.5rem 0;">\${data.api_key}</code>
              ⚠️ <strong>Simpan key ini!</strong> Tidak akan ditampilkan lagi.
            </div>
          \`;
          keyLabel.value = '';
          loadKeys(); // Refresh daftar
        } else {
          generateResult.innerHTML = \`<div class="alert alert-error">❌ \${data.error}</div>\`;
        }
      } catch (err) {
        generateResult.innerHTML = \`<div class="alert alert-error">❌ Error: \${err.message}</div>\`;
      }
    });

    // ---------- Refresh ----------
    refreshBtn.addEventListener('click', loadKeys);

    // ---------- Load pertama ----------
    loadKeys();

    console.log('📊 Dashboard loaded.');
  })();
</script>

</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
