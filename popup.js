const $ = id => document.getElementById(id);

// ── Helpers ──────────────────────────────────────────────
function setStatus(state, text) {
  const dot = $('statusDot');
  dot.className = 'dot ' + (state === 'ok' ? '' : state);
  $('statusText').textContent = text;
  if (state === 'ok') {
    $('statusTime').textContent = new Date().toLocaleTimeString();
  }
}

const SOURCE_NAMES = {
  apple_healthkit: 'Apple Health', asana_mcp_merge: 'Asana',
  cbinsights_mcp_cashmere: 'CB Insights', confluence_mcp_merge: 'Confluence',
  dropbox: 'Dropbox', gcal: 'Google Calendar', github_mcp_direct: 'GitHub',
  google_drive: 'Google Drive', jira_mcp_merge: 'Jira', linear_alt: 'Linear',
  microsoft_teams_mcp_merge: 'Microsoft Teams', notion_mcp: 'Notion',
  outlook: 'Outlook', pitchbook_mcp_cashmere: 'PitchBook', scholar: 'Scholar',
  slack_direct: 'Slack', social: 'Social Media', statista_mcp_cashmere: 'Statista',
  web: 'Web Search', wiley_mcp_cashmere: 'Wiley',
};
function srcName(k) {
  return SOURCE_NAMES[k] || k.replace(/_mcp_\w+/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function n(v, fb = '—') {
  if (v == null) return fb;
  return typeof v === 'number' ? v.toLocaleString() : String(v);
}

function sh(label) {
  return `<div class="sh"><span class="sh-label">${label}</span><div class="sh-line"></div></div>`;
}

// ── Fetch ────────────────────────────────────────────────
async function fetchBoth() {
  const [rR, sR] = await Promise.all([
    fetch('https://www.perplexity.ai/rest/rate-limit/all',  { credentials: 'include' }),
    fetch('https://www.perplexity.ai/rest/user/settings',   { credentials: 'include' }),
  ]);
  if (!rR.ok) throw new Error(`rate-limit/all → HTTP ${rR.status}`);
  if (!sR.ok) throw new Error(`user/settings → HTTP ${sR.status}`);
  const [rate, settings] = await Promise.all([rR.json(), sR.json()]);
  return { rate, settings };
}

// ── Dashboard ────────────────────────────────────────────
function renderDashboard(rate, settings) {
  const s = settings;
  const tier      = s.subscription_tier    ? s.subscription_tier.charAt(0).toUpperCase() + s.subscription_tier.slice(1) : null;
  const subStatus = s.subscription_status  ?? null;
  const isActive  = subStatus === 'active';
  const subSrc    = s.subscription_source  ?? null;
  const referral  = s.referral_code        ?? null;
  const cl        = s.connector_limits     ?? {};
  const sources   = s.sources?.source_to_limit ?? {};
  const limited   = Object.entries(sources).filter(([, v]) => v.monthly_limit != null);
  const unlimited = Object.entries(sources).filter(([, v]) => v.monthly_limit == null);

  // Rate-limit/all flat + nested
  const rateFlat   = Object.entries(rate).filter(([, v]) => v !== null && typeof v !== 'object');
  const rateNested = Object.entries(rate).filter(([, v]) => v !== null && typeof v === 'object' && !Array.isArray(v));

  // Coupon expiry note
  const couponName    = s.coupon_metadata?.name ?? null;
  const couponExpiry  = s.coupon_metadata?.expires_at ? new Date(s.coupon_metadata.expires_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : null;

  return `<div class="content fade-in">

    <!-- Subscription -->
    <div>
      ${sh('Plan')}
      <div class="sub-card">
        <div class="sub-icon-wrap">✦</div>
        <div class="sub-body">
          <div class="sub-tier">
            ${tier ?? 'Unknown'}
            <span class="sub-tier-badge ${isActive ? 'badge-active' : 'badge-inactive'}">${subStatus ?? '—'}</span>
          </div>
          <div class="sub-meta">
            via <span>${subSrc ?? '—'}</span>
            ${couponName ? ` · ${couponName}` : ''}
            ${couponExpiry ? ` <span>· expires ${couponExpiry}</span>` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- Query usage -->
    <div>
      ${sh('Lifetime Query Usage')}
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-num hi">${n(s.query_count)}</div>
          <div class="stat-lbl">All Queries</div>
          <div class="stat-note">total ever sent</div>
        </div>
        <div class="stat-card">
          <div class="stat-num md">${n(s.query_count_copilot)}</div>
          <div class="stat-lbl">Copilot</div>
          <div class="stat-note">web + sources</div>
        </div>
        <div class="stat-card">
          <div class="stat-num md">${n(s.query_count_mobile)}</div>
          <div class="stat-lbl">Mobile</div>
          <div class="stat-note">app queries</div>
        </div>
      </div>
    </div>

    <!-- Resource limits -->
    <div>
      ${sh('Account Limits')}
      <div class="limits-grid">
        ${limitItem('Pages',         s.pages_limit,              'max saved pages')}
        ${limitItem('File Uploads',  s.upload_limit,             'max files per upload')}
        ${limitItem('Collections',   s.create_limit,             'max spaces / collections')}
        ${limitItem('Article Images',s.article_image_upload_limit,'images per article')}
        ${limitItem('Files per User',s.max_files_per_user,       'total file storage')}
      </div>
    </div>

    <!-- Connector file limits -->
    <div>
      ${sh('Connector File Limits')}
      <div class="conn-grid">
        <div class="conn-card">
          <div class="conn-val">${n(cl.daily_attachment_limit, '∞')}</div>
          <div class="conn-lbl">Daily Attachments</div>
        </div>
        <div class="conn-card">
          <div class="conn-val">${n(cl.global_file_count, '∞')}</div>
          <div class="conn-lbl">Total File Slots</div>
        </div>
        <div class="conn-card">
          <div class="conn-val">${n(cl.max_file_size_mb, '∞')}<span class="conn-unit"> MB</span></div>
          <div class="conn-lbl">Max File Size</div>
        </div>
      </div>
    </div>

    <!-- Rate-limit/all section -->
    ${rateFlat.length > 0 || rateNested.length > 0 ? `
    <div>
      ${sh('Current Rate Limits')}
      ${rateFlat.length > 0 ? `
      <div class="kv-list">
        ${rateFlat.map(([k, v]) => `
          <div class="kv-item">
            <span class="kv-k">${k.replace(/_/g,' ')}</span>
            <span class="kv-v">${n(v)}</span>
          </div>`).join('')}
      </div>` : ''}
      ${rateNested.map(([k, obj]) => {
        const rows = Object.entries(obj).filter(([,v2]) => v2 !== null && typeof v2 !== 'object');
        if (!rows.length) return '';
        return `
          <div style="margin-top:6px">
            <div style="font-size:9px;color:var(--dim);margin-bottom:4px;text-transform:capitalize">${k.replace(/_/g,' ')}</div>
            <div class="kv-list">
              ${rows.map(([k2, v2]) => `
                <div class="kv-item">
                  <span class="kv-k">${k2.replace(/_/g,' ')}</span>
                  <span class="kv-v">${n(v2)}</span>
                </div>`).join('')}
            </div>
          </div>`;
      }).join('')}
    </div>` : `
    <div>
      ${sh('Current Rate Limits')}
      <div class="empty-note">No extra rate-limit data returned by this endpoint. Check Raw JSON tab for the full response.</div>
    </div>`}

    <!-- Monthly-capped sources -->
    ${limited.length > 0 ? `
    <div>
      ${sh('Monthly Source Limits')}
      <div class="sources-grid">
        ${limited.map(([key, v]) => {
          const used = v.monthly_limit - (v.remaining ?? 0);
          const pct  = v.monthly_limit ? Math.round((used / v.monthly_limit) * 100) : 0;
          const cls  = pct >= 100 ? 'src-full' : pct >= 75 ? 'src-warn' : 'src-ok';
          return `<div class="src-row">
            <span class="src-name">${srcName(key)}</span>
            <span class="src-badge ${cls}">${v.remaining ?? '?'} / ${v.monthly_limit}</span>
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}

    <!-- Unlimited sources -->
    ${unlimited.length > 0 ? `
    <div>
      ${sh(`Unlimited Sources · ${unlimited.length}`)}
      <div class="sources-grid">
        ${unlimited.map(([key]) => `
          <div class="src-row">
            <span class="src-name">${srcName(key)}</span>
            <span class="src-badge src-unlimited">unlimited</span>
          </div>`).join('')}
      </div>
    </div>` : ''}

  </div>`;
}

function limitItem(label, value, desc) {
  return `
    <div class="limit-item">
      <div>
        <div class="limit-name">${label}</div>
        <div class="limit-desc">${desc}</div>
      </div>
      <div>
        <div class="limit-val">${n(value, '—')}</div>
        <div class="limit-desc-right">${value != null ? 'cap' : 'no limit'}</div>
      </div>
    </div>`;
}

// ── Raw JSON ─────────────────────────────────────────────
function renderRaw(rate, settings) {
  function hl(json) {
    return json
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, m => {
        let c = 'j-num';
        if (/^"/.test(m)) c = /:$/.test(m) ? 'j-key' : 'j-str';
        else if (/true|false/.test(m)) c = 'j-bool';
        else if (/null/.test(m)) c = 'j-null';
        return `<span class="${c}">${m}</span>`;
      });
  }
  return `<div class="content fade-in" style="gap:10px">
    ${sh('/rest/rate-limit/all')}
    <pre class="raw-block">${hl(JSON.stringify(rate, null, 2))}</pre>
    ${sh('/rest/user/settings')}
    <pre class="raw-block">${hl(JSON.stringify(settings, null, 2))}</pre>
  </div>`;
}

// ── State ────────────────────────────────────────────────
let lastData = null;
let activeTab = 'dashboard';

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  if (lastData) {
    $('app').innerHTML = tab === 'raw'
      ? renderRaw(lastData.rate, lastData.settings)
      : renderDashboard(lastData.rate, lastData.settings);
  }
}

// ── Load ─────────────────────────────────────────────────
async function load() {
  const btn = $('refreshBtn');
  btn.classList.add('spinning');
  setStatus('loading', 'Fetching…');
  $('statusTime').textContent = '';

  try {
    const data = await fetchBoth();
    lastData = data;
    $('app').innerHTML = activeTab === 'raw'
      ? renderRaw(data.rate, data.settings)
      : renderDashboard(data.rate, data.settings);
    setStatus('ok', 'Live · perplexity.ai');
    $('footNote').textContent = `${Object.keys(data.rate).length} rate keys · ${Object.keys(data.settings).length} setting keys`;
  } catch (err) {
    $('app').innerHTML = `
      <div class="state-box">
        <div class="icon">⚠</div>
        <p class="msg">${err.message}</p>
        <p class="hint">Log in to perplexity.ai in this browser, then click Refresh.</p>
      </div>`;
    setStatus('error', 'Failed to fetch');
  } finally {
    btn.classList.remove('spinning');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  $('refreshBtn').addEventListener('click', load);
  load();
});
