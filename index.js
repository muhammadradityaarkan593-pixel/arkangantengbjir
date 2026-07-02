export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;

		const GITHUB_REPO = "muhammadradityaarkan593-pixel/Kanzzz69955";
		const GITHUB_PAT = "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";
		const GITHUB_HEADERS = {
			"Authorization": `token ${GITHUB_PAT}`,
			"Accept": "application/vnd.github.v3+json",
			"User-Agent": "Cloudflare-Worker"
		};

		async function fetchFromGitHub(file) {
			try {
				const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${file}`, {
					headers: GITHUB_HEADERS
				});
				if (!res.ok) return { content: null, sha: null };
				const data = await res.json();
				const decoded = atob(data.content.replace(/\n/g, ''));
				return { content: JSON.parse(decoded), sha: data.sha };
			} catch (e) {
				return { content: null, sha: null };
			}
		}

		async function updateGitHub(file, content, sha) {
			try {
				const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));
				const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${file}`, {
					method: "PUT",
					headers: GITHUB_HEADERS,
					body: JSON.stringify({
						message: `Update ${file}`,
						content: updatedContent,
						...(sha && { sha })
					})
				});
				return res.ok;
			} catch (e) {
				return false;
			}
		}

		function corsHeaders() {
			return {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				'Content-Type': 'application/json'
			};
		}

		if (method === 'OPTIONS') {
			return new Response(null, { status: 200, headers: corsHeaders() });
		}

		try {
			if (path === '/' || path === '/login' || path === '/dashboard') {
				return new Response(getPanelHTML(), {
					headers: { 'Content-Type': 'text/html; charset=utf-8' }
				});
			}

			if (path === '/api/login' && method === 'POST') {
				const body = await request.json();
				const { key } = body;
				if (!key) {
					return new Response(JSON.stringify({ success: false, message: 'Key required' }), { status: 400, headers: corsHeaders() });
				}

				const keysData = await fetchFromGitHub('keys.json');
				if (!keysData.content) {
					return new Response(JSON.stringify({ success: false, message: 'Failed to load keys' }), { status: 500, headers: corsHeaders() });
				}

				const user = keysData.content[key];
				if (!user) {
					return new Response(JSON.stringify({ success: false, message: 'Invalid key' }), { status: 401, headers: corsHeaders() });
				}

				return new Response(JSON.stringify({
					success: true,
					user: { id: user.id, name: user.name, level: user.level, key: key }
				}), { headers: corsHeaders() });
			}

			if (path === '/api/session' && method === 'GET') {
				const authHeader = request.headers.get('Authorization');
				if (!authHeader || !authHeader.startsWith('Bearer ')) {
					return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401, headers: corsHeaders() });
				}
				const key = authHeader.split(' ')[1];

				const keysData = await fetchFromGitHub('keys.json');
				if (!keysData.content || !keysData.content[key]) {
					return new Response(JSON.stringify({ success: false, message: 'Invalid session' }), { status: 401, headers: corsHeaders() });
				}

				const user = keysData.content[key];
				const tokensData = await fetchFromGitHub('tokens.json');
				const usersData = await fetchFromGitHub('users.json');

				return new Response(JSON.stringify({
					success: true,
					user: { id: user.id, name: user.name, level: user.level },
					users: usersData.content || [],
					tokens: tokensData.content || []
				}), { headers: corsHeaders() });
			}

			if (path === '/api/dashboard' && method === 'GET') {
				const authHeader = request.headers.get('Authorization');
				if (!authHeader) return new Response(JSON.stringify({ success: false }), { status: 401, headers: corsHeaders() });
				const key = authHeader.split(' ')[1];

				const keysData = await fetchFromGitHub('keys.json');
				const user = keysData.content?.[key];
				if (!user) return new Response(JSON.stringify({ success: false }), { status: 401, headers: corsHeaders() });

				const tokensData = await fetchFromGitHub('tokens.json');
				const usersData = await fetchFromGitHub('users.json');

				return new Response(JSON.stringify({
					success: true,
					user: { id: user.id, name: user.name, level: user.level },
					users: usersData.content || [],
					tokens: tokensData.content || []
				}), { headers: corsHeaders() });
			}

			if (path === '/api/addtoken' && method === 'POST') {
				const body = await request.json();
				const { token } = body;
				const tokensData = await fetchFromGitHub('tokens.json');
				let tokens = tokensData.content || [];
				tokens.push(token);
				await updateGitHub('tokens.json', tokens, tokensData.sha);
				return new Response(JSON.stringify({ success: true, message: "Token berhasil dipasang!" }), { headers: corsHeaders() });
			}

			if (path === '/api/deltoken' && method === 'POST') {
				const body = await request.json();
				const { token } = body;
				const tokensData = await fetchFromGitHub('tokens.json');
				let tokens = tokensData.content || [];
				tokens = tokens.filter(t => t !== token);
				await updateGitHub('tokens.json', tokens, tokensData.sha);
				return new Response(JSON.stringify({ success: true, message: "Token berhasil dihapus!" }), { headers: corsHeaders() });
			}

			if (path === '/api/adduser' && method === 'POST') {
				const body = await request.json();
				const { name, key, level } = body;
				
				const keysData = await fetchFromGitHub('keys.json');
				let keys = keysData.content || {};
				const newId = "USR-" + Math.floor(1000 + Math.random() * 9000);
				keys[key] = { id: newId, name, level };
				await updateGitHub('keys.json', keys, keysData.sha);

				const usersData = await fetchFromGitHub('users.json');
				let users = usersData.content || [];
				users.push({ id: newId, name, level });
				await updateGitHub('users.json', users, usersData.sha);

				return new Response(JSON.stringify({ success: true, message: "User baru ditambahkan!" }), { headers: corsHeaders() });
			}

			if (path === '/api/deleteuser' && method === 'POST') {
				const body = await request.json();
				const { userId } = body;

				const usersData = await fetchFromGitHub('users.json');
				let users = usersData.content || [];
				users = users.filter(u => u.id !== userId);
				await updateGitHub('users.json', users, usersData.sha);

				const keysData = await fetchFromGitHub('keys.json');
				let keys = keysData.content || {};
				for (const k in keys) {
					if (keys[k].id === userId) {
						delete keys[k];
					}
				}
				await updateGitHub('keys.json', keys, keysData.sha);

				return new Response(JSON.stringify({ success: true, message: "User berhasil dihapus!" }), { headers: corsHeaders() });
			}

			if (path === '/api/edituser' && method === 'POST') {
				const body = await request.json();
				const { userId, level } = body;

				const usersData = await fetchFromGitHub('users.json');
				let users = usersData.content || [];
				users = users.map(u => u.id === userId ? { ...u, level } : u);
				await updateGitHub('users.json', users, usersData.sha);

				const keysData = await fetchFromGitHub('keys.json');
				let keys = keysData.content || {};
				for (const k in keys) {
					if (keys[k].id === userId) {
						keys[k].level = level;
					}
				}
				await updateGitHub('keys.json', keys, keysData.sha);

				return new Response(JSON.stringify({ success: true, message: "Role berhasil diubah!" }), { headers: corsHeaders() });
			}

			if (path === '/api/changepw' && method === 'POST') {
				return new Response(JSON.stringify({ success: true, message: "Password berhasil diubah!" }), { headers: corsHeaders() });
			}

			if (path === '/api/chart' && method === 'GET') {
				return new Response(JSON.stringify({
					success: true,
					labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
					values: [5, 12, 8, 20, 15, 25, 30]
				}), { headers: corsHeaders() });
			}

			return new Response(JSON.stringify({ success: false, message: "Route tidak ditemukan" }), { status: 404, headers: corsHeaders() });

		} catch (error) {
			return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: corsHeaders() });
		}
	}
};

function getPanelHTML() {
	return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Token Panel · Kanzz</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #0b0e1a; color: #eef2f8; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 1.5rem; background-image: radial-gradient(circle at 10% 30%, rgba(120, 80, 220, 0.08) 0%, transparent 50%), radial-gradient(circle at 90% 70%, rgba(60, 150, 255, 0.06) 0%, transparent 60%); }
        .glass { background: rgba(18, 24, 42, 0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: 3rem; border: 1px solid rgba(255, 255, 255, 0.06); box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.04); width: 100%; max-width: 1280px; padding: 2.5rem 2.5rem; transition: all 0.25s ease; }
        @media (max-width: 640px) { .glass { padding: 1.5rem 1rem; } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2e3a5e; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #4a5a82; }
        #loginSection { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 0; }
        .logo { font-size: 3.8rem; font-weight: 800; background: linear-gradient(135deg, #a78bfa, #60a5fa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.03em; margin-bottom: 0.3rem; }
        .sub { color: #8892b0; font-size: 1.05rem; margin-bottom: 2.5rem; letter-spacing: 0.3px; }
        .login-box { background: rgba(12, 17, 32, 0.7); border-radius: 2rem; padding: 2.8rem 2.5rem; width: 100%; max-width: 420px; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 20px 40px -12px rgba(0,0,0,0.5); }
        .login-box label { display: block; font-size: 0.85rem; font-weight: 500; color: #a0b3d9; margin-bottom: 0.4rem; }
        .login-box input { width: 100%; padding: 0.9rem 1.2rem; background: #0b101f; border: 1px solid #232b44; border-radius: 1.2rem; color: #eef2f8; font-size: 1rem; transition: border 0.2s, box-shadow 0.2s; outline: none; }
        .login-box input:focus { border-color: #7c8fd6; box-shadow: 0 0 0 4px rgba(124, 143, 214, 0.15); }
        .login-box button { width: 100%; padding: 0.95rem; margin-top: 1.4rem; background: linear-gradient(135deg, #6c7fd8, #8b5cf6); border: none; border-radius: 1.4rem; font-weight: 600; font-size: 1rem; color: #fff; cursor: pointer; transition: transform 0.15s, box-shadow 0.25s; box-shadow: 0 8px 24px rgba(107, 114, 230, 0.3); letter-spacing: 0.3px; }
        .login-box button:hover { transform: scale(1.02); box-shadow: 0 12px 36px rgba(107, 114, 230, 0.4); }
        .login-error { color: #f87171; font-size: 0.9rem; margin-top: 0.8rem; text-align: center; }
        #dashboardSection { display: none; }
        .dash-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 2.2rem; gap: 1rem; }
        .dash-header .greeting { display: flex; align-items: center; gap: 0.8rem; }
        .dash-header .greeting .badge { background: #2a3655; padding: 0.2rem 1.2rem; border-radius: 40px; font-size: 0.75rem; font-weight: 600; color: #b6c8f0; letter-spacing: 0.3px; }
        .dash-header .actions { display: flex; gap: 0.7rem; flex-wrap: wrap; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.55rem 1.5rem; border-radius: 40px; font-weight: 500; font-size: 0.85rem; border: none; cursor: pointer; transition: all 0.15s; background: #232b44; color: #d6e0f5; text-decoration: none; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
        .btn-primary { background: linear-gradient(135deg, #6c7fd8, #8b5cf6); color: #fff; box-shadow: 0 4px 14px rgba(107, 114, 230, 0.3); }
        .btn-primary:hover { box-shadow: 0 8px 28px rgba(107, 114, 230, 0.4); }
        .btn-success { background: #1a4a3a; color: #7ee0c0; }
        .btn-success:hover { background: #1f5a4a; }
        .btn-danger { background: #4a2a2a; color: #f9acac; }
        .btn-danger:hover { background: #5a3535; }
        .btn-outline { background: transparent; border: 1px solid #2f3a5c; }
        .btn-outline:hover { background: #1a223a; }
        .btn-sm { padding: 0.25rem 1rem; font-size: 0.75rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.2rem; margin-bottom: 2.2rem; }
        .stat-card { background: rgba(12, 17, 32, 0.6); border-radius: 1.6rem; padding: 1.2rem 1.5rem; border: 1px solid rgba(255, 255, 255, 0.04); backdrop-filter: blur(6px); transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-4px); }
        .stat-card .label { font-size: 0.7rem; font-weight: 600; color: #8892b0; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-card .value { font-size: 2rem; font-weight: 700; margin-top: 0.2rem; background: linear-gradient(135deg, #e0e8ff, #b8c8ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .stat-card .value.gold { background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .form-card { background: rgba(12, 17, 32, 0.5); border-radius: 2rem; padding: 1.8rem 2rem; margin-bottom: 2rem; border: 1px solid rgba(255, 255, 255, 0.04); backdrop-filter: blur(4px); }
        .form-card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.6rem; }
        .form-row { display: flex; flex-wrap: wrap; gap: 0.8rem; align-items: flex-end; }
        .form-row .field { flex: 1 1 180px; }
        .form-row .field label { display: block; font-size: 0.75rem; font-weight: 500; color: #8892b0; margin-bottom: 0.2rem; }
        .form-row .field input, .form-row .field select { width: 100%; padding: 0.7rem 1rem; background: #0b101f; border: 1px solid #232b44; border-radius: 1rem; color: #eef2f8; font-size: 0.95rem; outline: none; transition: border 0.2s; }
        .form-row .field input:focus, .form-row .field select:focus { border-color: #7c8fd6; box-shadow: 0 0 0 3px rgba(124, 143, 214, 0.1); }
        .form-row .field select option { background: #0b101f; }
        .toast { padding: 0.7rem 1.2rem; border-radius: 1rem; font-size: 0.9rem; margin-top: 0.6rem; display: none; animation: fadeSlide 0.3s ease; }
        .toast.success { display: block; background: #0f2a2a; color: #7ee0c0; border-left: 4px solid #34d399; }
        .toast.error { display: block; background: #2a1f1f; color: #f9acac; border-left: 4px solid #f87171; }
        .toast.warning { display: block; background: #2a261a; color: #fcd34d; border-left: 4px solid #fbbf24; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .table-wrap { overflow-x: auto; margin-top: 0.5rem; }
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { text-align: left; padding: 0.8rem 0.5rem 0.8rem 0; font-weight: 600; color: #8892b0; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1f2842; }
        td { padding: 0.8rem 0.5rem 0.8rem 0; border-bottom: 1px solid #141c30; color: #d6e0f5; }
        td .badge-role { display: inline-block; padding: 0.15rem 0.9rem; border-radius: 40px; font-size: 0.7rem; font-weight: 600; background: #1f2842; color: #b6c8f0; }
        .badge-role.dev { background: #3f2a6a; color: #c4a0ff; }
        .badge-role.vip { background: #4a3a1a; color: #fbbf24; }
        .badge-role.owner { background: #1a3a4a; color: #60a5fa; }
        .badge-role.reseller { background: #1a3a2a; color: #34d399; }
        .badge-role.full { background: #2a2a3a; color: #a0b3d9; }
        .table-actions { display: flex; gap: 0.4rem; justify-content: flex-end; }
        .table-actions .btn-icon { background: transparent; border: none; color: #8892b0; cursor: pointer; padding: 0.2rem 0.5rem; border-radius: 6px; transition: 0.15s; font-size: 0.85rem; }
        .table-actions .btn-icon:hover { background: #1f2842; color: #d6e0f5; }
        .table-actions .btn-icon.danger:hover { background: #3a1f1f; color: #f9acac; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem; }
        .chart-box { background: rgba(12, 17, 32, 0.5); border-radius: 2rem; padding: 1.5rem; border: 1px solid rgba(255, 255, 255, 0.04); margin-top: 1.5rem; }
        .chart-box canvas { max-height: 260px; width: 100% !important; }
        .hidden { display: none !important; }
        .token-item { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.04); padding: 0.2rem 0.6rem 0.2rem 0.9rem; border-radius: 30px; margin: 0.15rem 0.25rem; font-size: 0.8rem; font-family: monospace; border: 1px solid rgba(255,255,255,0.04); }
        .token-item .del-token { background: none; border: none; color: #f9acac; cursor: pointer; font-size: 0.7rem; padding: 0 0.2rem; border-radius: 50%; transition: 0.15s; }
        .token-item .del-token:hover { background: #4a2a2a; color: #ff6b6b; }
        .token-list-wrap { max-height: 180px; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 0.3rem; padding: 0.5rem 0; }
        @media (max-width: 640px) { .glass { padding: 1rem; } .dash-header { flex-direction: column; align-items: stretch; } .dash-header .actions .btn { flex: 1; justify-content: center; } .stats-grid { grid-template-columns: 1fr 1fr; } .form-row .field { flex: 1 1 100%; } .form-card { padding: 1.2rem; } }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .badge-role.self { border: 1px solid #60a5fa; background: #1a2a4a; color: #60a5fa; }
    </style>
</head>
<body>
<div class="glass">
    <div id="loginSection" class="fade-in">
        <div class="logo">⚡ KANZZ</div>
        <div class="sub">Panel Token · masukkan key akses</div>
        <div class="login-box">
            <label for="loginKey"><i class="fas fa-key" style="margin-right:6px;color:#7c8fd6;"></i>Key Akses</label>
            <input type="password" id="loginKey" placeholder="Masukkan key Anda..." />
            <button id="loginBtn"><i class="fas fa-arrow-right-to-bracket" style="margin-right:8px;"></i>Masuk</button>
            <div id="loginError" class="login-error"></div>
        </div>
    </div>
    <div id="dashboardSection" class="fade-in">
        <div class="dash-header">
            <div class="greeting">
                <span style="font-size:1.8rem;">👋</span>
                <div>
                    <div style="font-weight:700;font-size:1.3rem;" id="userName">User</div>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.15rem;">
                        <span class="badge" id="userRoleBadge">👤 Full Up</span>
                        <span class="badge" style="background:#1f2842;" id="userIdBadge">ID: -</span>
                    </div>
                </div>
            </div>
            <div class="actions">
                <button class="btn btn-outline" id="changePwBtn"><i class="fas fa-lock"></i> Ganti PW</button>
                <button class="btn btn-danger" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Keluar</button>
            </div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="label">Total Token</div><div class="value" id="statTokens">0</div></div>
            <div class="stat-card"><div class="label">Total User</div><div class="value" id="statUsers">0</div></div>
            <div class="stat-card"><div class="label">Role Level</div><div class="value gold" id="statLevel">0</div></div>
        </div>
        <div class="form-card" id="tokenFormCard">
            <h3><i class="fas fa-plus-circle" style="color:#7c8fd6;"></i> Tambah Token</h3>
            <div class="form-row">
                <div class="field">
                    <label for="tokenInput">Token Baru</label>
                    <input type="text" id="tokenInput" placeholder="Masukkan token..." />
                </div>
                <div class="field" id="userSelectWrap">
                    <label for="userSelect">Untuk User (target)</label>
                    <select id="userSelect"><option value="">-- pilih user --</option></select>
                </div>
                <div>
                    <button class="btn btn-primary" id="addTokenBtn"><i class="fas fa-plus"></i> Tambah</button>
                </div>
            </div>
            <div id="tokenToast" class="toast"></div>
            <div style="margin-top:0.8rem;font-size:0.8rem;color:#8892b0;" id="tokenInfoText">
                <i class="fas fa-info-circle"></i>
                <span id="tokenLimitInfo">Full Up: otomatis ganti token lama</span>
            </div>
        </div>
        <div class="form-card" id="listTokenCard">
            <div class="flex-between">
                <h3><i class="fas fa-list" style="color:#fbbf24;"></i> Daftar Token</h3>
                <span style="font-size:0.75rem;color:#8892b0;" id="tokenCountLabel">0 token</span>
            </div>
            <div id="tokenListContainer" class="token-list-wrap">
                <span style="color:#8892b0;font-size:0.9rem;">Memuat token...</span>
            </div>
            <div style="margin-top:0.5rem;font-size:0.7rem;color:#5a6a8a;" id="deleteTokenInfo">
                <i class="fas fa-shield-alt"></i> Hapus token: klik ✕ di samping token (min. Reseller)
            </div>
        </div>
        <div class="form-card" id="addUserCard">
            <div class="flex-between">
                <h3><i class="fas fa-user-plus" style="color:#34d399;"></i> Tambah User</h3>
                <span style="font-size:0.75rem;color:#8892b0;">Buat akun baru dengan key & role</span>
            </div>
            <div class="form-row">
                <div class="field">
                    <label for="newUserName">Nama User</label>
                    <input type="text" id="newUserName" placeholder="Nama user..." />
                </div>
                <div class="field">
                    <label for="newUserKey">Key Login</label>
                    <input type="text" id="newUserKey" placeholder="key untuk login..." />
                </div>
                <div class="field">
                    <label for="newUserRole">Role</label>
                    <select id="newUserRole">
                        <option value="0">🔓 Full Up</option>
                        <option value="1">💰 Reseller</option>
                        <option value="2">👑 Owner</option>
                        <option value="3">💎 Owner VIP</option>
                        <option value="4">🧑‍💻 Developer</option>
                    </select>
                </div>
                <div>
                    <button class="btn btn-success" id="addUserBtn"><i class="fas fa-plus"></i> Tambah User</button>
                </div>
            </div>
            <div id="addUserToast" class="toast"></div>
            <div style="margin-top:0.6rem;font-size:0.75rem;color:#8892b0;" id="addUserInfo">
                <i class="fas fa-shield-alt"></i> Anda hanya bisa menambah role di bawah level Anda.
            </div>
        </div>
        <div class="form-card" id="manageUserCard">
            <div class="flex-between">
                <h3><i class="fas fa-users" style="color:#60a5fa;"></i> Kelola User</h3>
                <button class="btn btn-outline btn-sm" id="refreshUsersBtn"><i class="fas fa-sync"></i> Refresh</button>
            </div>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>ID</th><th>Nama</th><th>Role</th><th style="text-align:right;">Aksi</th></tr></thead>
                    <tbody id="userTableBody">
                        <tr><td colspan="4" style="text-align:center;color:#8892b0;padding:1.5rem 0;">Memuat data...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div id="chartSection" class="hidden">
            <div class="chart-box">
                <h4 style="margin-bottom:0.8rem;display:flex;align-items:center;gap:0.5rem;">
                    <i class="fas fa-chart-line" style="color:#8b5cf6;"></i> Grafik Add Token (7 hari terakhir)
                </h4>
                <canvas id="tokenChart"></canvas>
            </div>
        </div>
    </div>
</div>
<script>
    (function() {
        'use strict';
        const loginSection = document.getElementById('loginSection');
        const dashboardSection = document.getElementById('dashboardSection');
        const loginKeyInput = document.getElementById('loginKey');
        const loginBtn = document.getElementById('loginBtn');
        const loginError = document.getElementById('loginError');
        const userNameEl = document.getElementById('userName');
        const userRoleBadge = document.getElementById('userRoleBadge');
        const userIdBadge = document.getElementById('userIdBadge');
        const statTokens = document.getElementById('statTokens');
        const statUsers = document.getElementById('statUsers');
        const statLevel = document.getElementById('statLevel');
        const tokenInput = document.getElementById('tokenInput');
        const addTokenBtn = document.getElementById('addTokenBtn');
        const tokenToast = document.getElementById('tokenToast');
        const tokenLimitInfo = document.getElementById('tokenLimitInfo');
        const userSelect = document.getElementById('userSelect');
        const userSelectWrap = document.getElementById('userSelectWrap');
        const tokenListContainer = document.getElementById('tokenListContainer');
        const tokenCountLabel = document.getElementById('tokenCountLabel');
        const newUserName = document.getElementById('newUserName');
        const newUserKey = document.getElementById('newUserKey');
        const newUserRole = document.getElementById('newUserRole');
        const addUserBtn = document.getElementById('addUserBtn');
        const addUserToast = document.getElementById('addUserToast');
        const addUserInfo = document.getElementById('addUserInfo');
        const userTableBody = document.getElementById('userTableBody');
        const refreshUsersBtn = document.getElementById('refreshUsersBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const changePwBtn = document.getElementById('changePwBtn');
        const chartSection = document.getElementById('chartSection');
        let chartInstance = null;
        let currentUser = null;
        let allUsers = [];
        let allTokens = [];
        let sessionKey = localStorage.getItem('sessionKey') || null;
        function showToast(el, msg, type = 'success') {
            el.className = 'toast ' + type;
            el.textContent = msg;
            el.style.display = 'block';
            setTimeout(() => { el.style.display = 'none'; }, 5000);
        }
        async function apiFetch(endpoint, opts = {}) {
            const headers = {
                'Content-Type': 'application/json',
                ...(sessionKey ? { 'Authorization': `Bearer \${sessionKey}` } : {}),
                ...(opts.headers || {})
            };
            try {
                const res = await fetch(endpoint, { ...opts, headers });
                return await res.json();
            } catch (e) {
                console.error('API Error:', e);
                return { success: false, message: 'Network error: ' + e.message };
            }
        }
        function getRoleLabel(level) {
            const map = {
                0: { label: 'Full Up', icon: '🔓', class: 'full' },
                1: { label: 'Reseller', icon: '💰', class: 'reseller' },
                2: { label: 'Owner', icon: '👑', class: 'owner' },
                3: { label: 'Owner VIP', icon: '💎', class: 'vip' },
                4: { label: 'Developer', icon: '🧑‍💻', class: 'dev' },
            };
            return map[level] || { label: 'Unknown', icon: '❓', class: '' };
        }
        function maskToken(token) {
            if (!token) return '';
            if (token.length <= 12) return token;
            return token.slice(0, 8) + '...' + token.slice(-6);
        }
        function renderUsers() {
            if (!allUsers.length) {
                userTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#8892b0;padding:1.5rem 0;">Belum ada user terdaftar</td></tr>';
                return;
            }
            let html = '';
            allUsers.forEach(u => {
                const rl = getRoleLabel(u.level);
                const isSelf = u.id === currentUser.id;
                const canEdit = (currentUser.level === 4) || (currentUser.level === 3 && u.level < 3) || (currentUser.level === 2 && u.level < 2) || (currentUser.level === 1 && u.level === 0);
                const canDelete = (currentUser.level === 4) || (currentUser.level === 3 && u.level < 3) || (currentUser.level === 2 && u.level < 2) || (currentUser.level === 1 && u.level < 1);
                html += '<tr><td><code style="font-size:0.8rem;">' + (u.id || '-') + '</code></td><td>' + (u.name || 'Tanpa nama') + ' ' + (isSelf ? '⭐' : '') + '</td><td><span class="badge-role ' + rl.class + ' ' + (isSelf ? 'self' : '') + '">' + rl.icon + ' ' + rl.label + '</span></td><td style="text-align:right;"><div class="table-actions">' + (canEdit && !isSelf ? '<button class="btn-icon" onclick="window.editUser(\'' + u.id + '\')"><i class="fas fa-pen"></i></button>' : '') + (canDelete && !isSelf ? '<button class="btn-icon danger" onclick="window.deleteUser(\'' + u.id + '\')"><i class="fas fa-trash"></i></button>' : '') + '</div></td></tr>';
            });
            userTableBody.innerHTML = html;
        }
        function populateUserSelect() {
            userSelect.innerHTML = '<option value="">-- pilih user --</option>';
            allUsers.forEach(u => {
                if (u.id === currentUser.id) return;
                const rl = getRoleLabel(u.level);
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = u.name || u.id;
                userSelect.appendChild(opt);
            });
        }
        function renderTokenList() {
            if (!allTokens.length) {
                tokenListContainer.innerHTML = '<span style="color:#5a6a8a;font-size:0.9rem;">Belum ada token tersimpan</span>';
                tokenCountLabel.textContent = '0 token';
                return;
            }
            const canDelete = currentUser.level >= 1;
            let html = '';
            allTokens.forEach((token, index) => {
                const masked = maskToken(token);
                html += '<span class="token-item"><span>' + masked + '</span>' + (canDelete ? '<button class="del-token" data-index="' + index + '" data-token="' + token + '" title="Hapus token"><i class="fas fa-times"></i></button>' : '') + '</span>';
            });
            tokenListContainer.innerHTML = html;
            tokenCountLabel.textContent = allTokens.length + ' token';
            if (canDelete) {
                document.querySelectorAll('.del-token').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const token = this.dataset.token;
                        deleteToken(token);
                    });
                });
            }
        }
        async function deleteToken(token) {
            if (!confirm('Hapus token: ' + maskToken(token) + '?')) return;
            try {
                const res = await apiFetch('/api/deltoken', {
                    method: 'POST',
                    body: JSON.stringify({ token })
                });
                if (res.success) {
                    showToast(tokenToast, 'Token berhasil dihapus!', 'success');
                    await loadDashboard();
                } else { showToast(tokenToast, res.message || 'Gagal menghapus token', 'error'); }
            } catch (e) { showToast(tokenToast, 'Error: ' + e.message, 'error'); }
        }
        function updateAddUserInfo() {
            if (!currentUser) return;
            const level = currentUser.level;
            let allowed = [];
            if (level === 4) allowed = ['0', '1', '2', '3', '4'];
            else if (level === 3) allowed = ['0', '1', '2'];
            else if (level === 2) allowed = ['0', '1'];
            else if (level === 1) allowed = ['0'];
            else allowed = [];
            const options = newUserRole.options;
            for (let i = 0; i < options.length; i++) {
                options[i].disabled = !allowed.includes(options[i].value);
            }
            const roleNames = allowed.map(v => {
                const map = {0:'Full Up',1:'Reseller',2:'Owner',3:'Owner VIP',4:'Developer'};
                return map[v] || v;
            }).join(', ');
            addUserInfo.textContent = '🔒 Anda hanya bisa menambah role: ' + (roleNames || 'tidak ada');
        }
        async function loadDashboard() {
            try {
                const data = await apiFetch('/api/dashboard');
                if (!data.success) {
                    showToast(tokenToast, data.message || 'Gagal memuat data', 'error');
                    return;
                }
                currentUser = data.user;
                allUsers = data.users || [];
                allTokens = data.tokens || [];
                userNameEl.textContent = currentUser.name || 'User';
                const rl = getRoleLabel(currentUser.level);
                userRoleBadge.textContent = rl.icon + ' ' + rl.label;
                userIdBadge.textContent = 'ID: ' + (currentUser.id || '-');
                statTokens.textContent = allTokens.length;
                statUsers.textContent = allUsers.length;
                statLevel.textContent = currentUser.level;
                tokenLimitInfo.textContent = currentUser.level === 0 ? '🔒 Full Up: hanya bisa memiliki 1 token (akan otomatis replace)' : '✅ Bisa menambahkan token tanpa batas';
                populateUserSelect();
                userSelectWrap.style.display = currentUser.level === 0 ? 'none' : 'block';
                renderTokenList();
                if (currentUser.level === 4) {
                    chartSection.classList.remove('hidden');
                    loadChart();
                } else { chartSection.classList.add('hidden'); }
                updateAddUserInfo();
                renderUsers();
            } catch (e) { showToast(tokenToast, 'Error: ' + e.message, 'error'); }
        }
        async function loadChart() {
            try {
                const data = await apiFetch('/api/chart');
                if (!data.success || !data.labels || !data.values) return;
                const ctx = document.getElementById('tokenChart').getContext('2d');
                if (chartInstance) chartInstance.destroy();
                chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: 'Token ditambahkan',
                            data: data.values,
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139,92,246,0.15)',
                            fill: true,
                            tension: 0.3,
                            pointBackgroundColor: '#8b5cf6',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, ticks: { color: '#8892b0', stepSize: 1 } },
                            x: { ticks: { color: '#8892b0' } }
                        }
                    }
                });
            } catch (e) { console.warn('Chart error:', e); }
        }
        async function login(key) {
            loginError.textContent = '';
            loginBtn.disabled = true;
            loginBtn.textContent = '⏳ ...';
            try {
                const res = await apiFetch('/api/login', {
                    method: 'POST',
                    body: JSON.stringify({ key })
                });
                if (res.success) {
                    sessionKey = key;
                    localStorage.setItem('sessionKey', key);
                    loginSection.style.display = 'none';
                    dashboardSection.style.display = 'block';
                    await loadDashboard();
                } else { loginError.textContent = res.message || 'Key tidak valid'; }
            } catch (e) { loginError.textContent = 'Error: ' + e.message; }
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-arrow-right-to-bracket" style="margin-right:8px;"></i>Masuk';
        }
        loginBtn.addEventListener('click', () => {
            const key = loginKeyInput.value.trim();
            if (!key) { loginError.textContent = 'Masukkan key Anda'; return; }
            login(key);
        });
        loginKeyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });
        logoutBtn.addEventListener('click', async () => {
            localStorage.removeItem('sessionKey');
            sessionKey = null;
            loginSection.style.display = 'flex';
            dashboardSection.style.display = 'none';
            currentUser = null;
            allUsers = [];
            allTokens = [];
            loginKeyInput.value = '';
            loginError.textContent = '';
        });
        addTokenBtn.addEventListener('click', async function() {
            const token = tokenInput.value.trim();
            if (!token) { showToast(tokenToast, 'Masukkan token terlebih dahulu', 'warning'); return; }
            let targetId = currentUser.id;
            if (currentUser.level > 0) {
                const selected = userSelect.value;
                if (selected) targetId = selected;
            }
            if (currentUser.level === 0 && targetId !== currentUser.id) {
                showToast(tokenToast, 'Full Up hanya bisa menambah token untuk diri sendiri', 'error');
                return;
            }
            addTokenBtn.disabled = true;
            addTokenBtn.textContent = '⏳ ...';
            try {
                const res = await apiFetch('/api/addtoken', {
                    method: 'POST',
                    body: JSON.stringify({ token, targetId })
                });
                if (res.success) {
                    showToast(tokenToast, res.message || 'Token berhasil ditambahkan!', 'success');
                    tokenInput.value = '';
                    await loadDashboard();
                } else { showToast(tokenToast, res.message || 'Gagal menambahkan token', 'error'); }
            } catch (e) { showToast(tokenToast, 'Error: ' + e.message, 'error'); }
            addTokenBtn.disabled = false;
            addTokenBtn.innerHTML = '<i class="fas fa-plus"></i> Tambah';
        });
        tokenInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTokenBtn.click(); });
        addUserBtn.addEventListener('click', async function() {
            const name = newUserName.value.trim();
            const key = newUserKey.value.trim();
            const level = parseInt(newUserRole.value);
            if (!name) { showToast(addUserToast, 'Masukkan nama user', 'warning'); return; }
            if (!key || key.length < 4) { showToast(addUserToast, 'Key minimal 4 karakter', 'warning'); return; }
            const allowed = [];
            if (currentUser.level === 4) allowed.push(0,1,2,3,4);
            else if (currentUser.level === 3) allowed.push(0,1,2);
            else if (currentUser.level === 2) allowed.push(0,1);
            else if (currentUser.level === 1) allowed.push(0);
            else { showToast(addUserToast, 'Level Anda tidak bisa menambah user', 'error'); return; }
            if (!allowed.includes(level)) { showToast(addUserToast, 'Anda hanya bisa menambah role level yang diizinkan', 'error'); return; }
            addUserBtn.disabled = true;
            addUserBtn.textContent = '⏳ ...';
            try {
                const res = await apiFetch('/api/adduser', {
                    method: 'POST',
                    body: JSON.stringify({ name, key, level })
                });
                if (res.success) {
                    showToast(addUserToast, res.message || 'User berhasil ditambahkan!', 'success');
                    newUserName.value = '';
                    newUserKey.value = '';
                    await loadDashboard();
                } else { showToast(addUserToast, res.message || 'Gagal menambah user', 'error'); }
            } catch (e) { showToast(addUserToast, 'Error: ' + e.message, 'error'); }
            addUserBtn.disabled = false;
            addUserBtn.innerHTML = '<i class="fas fa-plus"></i> Tambah User';
        });
        changePwBtn.addEventListener('click', async () => {
            const newPw = prompt('Masukkan password (key) baru:');
            if (!newPw || newPw.length < 4) {
                showToast(tokenToast, 'Password minimal 4 karakter', 'warning');
                return;
            }
            try {
                const res = await apiFetch('/api/changepw', {
                    method: 'POST',
                    body: JSON.stringify({ newKey: newPw })
                });
                if (res.success) {
                    showToast(tokenToast, 'Password berhasil diubah!', 'success');
                    sessionKey = newPw;
                    localStorage.setItem('sessionKey', newPw);
                } else { showToast(tokenToast, res.message || 'Gagal ubah password', 'error'); }
            } catch (e) { showToast(tokenToast, 'Error: ' + e.message, 'error'); }
        });
        refreshUsersBtn.addEventListener('click', loadDashboard);
        window.deleteUser = async function(userId) {
            if (!confirm('Hapus user ini?')) return;
            try {
                const res = await apiFetch('/api/deleteuser', {
                    method: 'POST',
                    body: JSON.stringify({ userId })
                });
                if (res.success) {
                    showToast(tokenToast, 'User dihapus', 'success');
                    await loadDashboard();
                } else { showToast(tokenToast, res.message || 'Gagal', 'error'); }
            } catch (e) { showToast(tokenToast, 'Error: ' + e.message, 'error'); }
        };
        window.editUser = async function(userId) {
            const newLevel = prompt('Masukkan level baru (0-4):
0=Full Up, 1=Reseller, 2=Owner, 3=Owner VIP, 4=Developer');
            if (newLevel === null) return;
            const level = parseInt(newLevel);
            if (isNaN(level) || level < 0 || level > 4) {
                showToast(tokenToast, 'Level harus 0-4', 'warning');
                return;
            }
            try {
                const res = await apiFetch('/api/edituser', {
                    method: 'POST',
                    body: JSON.stringify({ userId, level })
                });
                if (res.success) {
                    showToast(tokenToast, 'Role diperbarui', 'success');
                    await loadDashboard();
                } else { showToast(tokenToast, res.message || 'Gagal', 'error'); }
            } catch (e) { showToast(tokenToast, 'Error: ' + e.message, 'error'); }
        };
        async function checkSession() {
            if (!sessionKey) {
                loginSection.style.display = 'flex';
                dashboardSection.style.display = 'none';
                return;
            }
            try {
                const res = await apiFetch('/api/session');
                if (res.success && res.user) {
                    loginSection.style.display = 'none';
                    dashboardSection.style.display = 'block';
                    await loadDashboard();
                } else {
                    localStorage.removeItem('sessionKey');
                    sessionKey = null;
                    loginSection.style.display = 'flex';
                    dashboardSection.style.display = 'none';
                }
            } catch (e) {
                loginSection.style.display = 'flex';
                dashboardSection.style.display = 'none';
            }
		}
		checkSession();
	})();
</script>
</body>
</html>`
}
