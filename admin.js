// ============ حالة القصص ============
let stories = JSON.parse(localStorage.getItem('stories') || '[]');

function saveState() {
  localStorage.setItem('stories', JSON.stringify(stories));
  renderStoryList();
}

function renderStoryList() {
  const list = document.getElementById('storyList');
  document.getElementById('storyCount').textContent = stories.length;
  if (!stories.length) {
    list.innerHTML = '<p style="color:#999;">لا توجد قصص بعد.</p>';
    return;
  }
  list.innerHTML = stories.map((s, i) => `
    <div class="story-item">
      <span><strong>${s.titleAr}</strong></span>
      <button onclick="removeStory(${i})">حذف</button>
    </div>
  `).join('');
}

window.removeStory = (i) => { stories.splice(i, 1); saveState(); };

// ============ إضافة قصة ============
document.getElementById('storyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const s = {
    id: 'story-' + String(stories.length + 1).padStart(2, '0'),
    titleAr: val('titleAr'), titleEn: val('titleEn') || val('titleAr'), titleFr: val('titleFr') || val('titleAr'),
    author: val('author') || 'StoryDZ', cover: val('cover') || 'cover-01.jpg',
    contentAr: val('contentAr'), contentEn: val('contentEn') || val('contentAr'), contentFr: val('contentFr') || val('contentAr'),
    date: new Date().toISOString().slice(0, 10)
  };
  stories.push(s);
  saveState();
  e.target.reset();
  alert('✅ تمت إضافة القصة.');
});
function val(id) { return document.getElementById(id).value.trim(); }

// ============ التصميم المدمج للموقع ============
const CSS_CONTENT = `
:root { --bg: #fdfaf5; --text: #1a1a1a; --accent: #b85c38; --muted: #6b6b6b; --card-bg: #fff; --border: #e8e0d5; }
[data-theme="dark"] { --bg: #121212; --text: #e8e8e8; --card-bg: #1e1e1e; --border: #2a2a2a; --muted: #9a9a9a; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.8; transition: background .3s; }
img { max-width: 100%; display: block; } a { color: var(--accent); text-decoration: none; }
.site-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg); z-index: 100; flex-wrap: wrap; gap: 1rem; }
.logo { font-size: 1.5rem; font-weight: 700; color: var(--text); } .logo span { color: var(--accent); }
.site-header nav { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
.site-header nav a { color: var(--text); font-size: .95rem; } .site-header nav a:hover { color: var(--accent); }
.site-header nav a.active { color: var(--accent); font-weight: 700; }
.lang-links { display: flex; gap: 4px; border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
.lang-links a { padding: 4px 10px; font-size: .85rem; } .lang-links a.active { background: var(--accent); color: #fff; }
#themeToggle { background: none; border: 1px solid var(--border); border-radius: 50%; width: 36px; height: 36px; cursor: pointer; }
.hero { text-align: center; padding: 4rem 1.5rem; background: linear-gradient(135deg, #f6efe7, #fdfaf5); }
[data-theme="dark"] .hero { background: linear-gradient(135deg, #1a1a1a, #121212); }
.hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 1rem; }
.stories-grid { max-width: 1100px; margin: 0 auto; padding: 3rem 1.5rem; }
.stories-grid h2 { font-size: 1.8rem; margin-bottom: 2rem; text-align: center; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
.story-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; transition: transform .3s; }
.story-card:hover { transform: translateY(-4px); } .story-card img { width: 100%; height: 200px; object-fit: cover; }
.card-body { padding: 1rem; } .card-body h3 { font-size: 1.2rem; margin-bottom: .3rem; } .card-body p { color: var(--muted); font-size: .9rem; }
.story-page { max-width: 750px; margin: 0 auto; padding: 2rem 1.5rem; }
.story-header { text-align: center; margin-bottom: 2rem; } .story-header h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); margin: .8rem 0; }
.story-header .meta { color: var(--muted); font-size: .9rem; } .story-cover { border-radius: 10px; margin-top: 1.5rem; width: 100%; max-height: 400px; object-fit: cover; }
.story-content { font-size: 1.15rem; line-height: 2; } .story-content p { margin-bottom: 1.3rem; }
.adsense-slot { margin: 2rem 0; text-align: center; min-height: 100px; }
.site-footer { text-align: center; padding: 2rem 1rem; border-top: 1px solid var(--border); color: var(--muted); }
.story-nav { margin: 3rem 0; padding: 1.5rem 0; border-top: 1px solid var(--border); }
`;

const JS_CONTENT = `
const root = document.documentElement;
const saved = localStorage.getItem('theme');
if (saved) root.setAttribute('data-theme', saved);
document.getElementById('themeToggle')?.addEventListener('click', () => {
  const cur = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', cur); localStorage.setItem('theme', cur);
  document.getElementById('themeToggle').textContent = cur === 'dark' ? '☀️' : '🌙';
});
`;

// ============ محرك بناء الصفحات ============
const LANGS = ['ar', 'en', 'fr'];
const LANG_META = {
  ar: { dir: 'rtl', nav: { home: 'الرئيسية', about: 'من نحن', contact: 'اتصل بنا', privacy: 'الخصوصية' }, all: 'أحدث القصص', back: '← الرئيسية' },
  en: { dir: 'ltr', nav: { home: 'Home', about: 'About', contact: 'Contact', privacy: 'Privacy' }, all: 'Latest Stories', back: '← Home' },
  fr: { dir: 'ltr', nav: { home: 'Accueil', about: 'À propos', contact: 'Contact', privacy: 'Confidentialité' }, all: 'Dernières histoires', back: '← Accueil' }
};

function cfg() {
  return { siteName: val('siteName'), domain: val('domain').replace(/\/$/, ''), adsClient: val('adsenseClient'), email: val('contactEmail'), aboutAr: val('aboutAr'), aboutEn: val('aboutEn'), aboutFr: val('aboutFr') };
}

function buildHead(lang, title, desc, path, c) {
  const m = LANG_META[lang];
  const ads = c.adsClient ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${c.adsClient}" crossorigin="anonymous"><\/script>` : '';
  return `<!DOCTYPE html>\n<html lang="${lang}" dir="${m.dir}">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${title} — ${c.siteName}</title>\n<meta name="description" content="${desc}">\n<link rel="canonical" href="${c.domain}/${lang}/${path}">\n<link rel="alternate" hreflang="ar" href="${c.domain}/ar/${path}">\n<link rel="alternate" hreflang="en" href="${c.domain}/en/${path}">\n<link rel="alternate" hreflang="fr" href="${c.domain}/fr/${path}">\n${ads}\n<link rel="stylesheet" href="../css/style.css">\n</head>`;
}

function buildHeader(lang, path, c) {
  const m = LANG_META[lang];
  return `<body>\n<header class="site-header">\n  <a href="index.html" class="logo">${c.siteName.replace('DZ', '<span>DZ</span>')}</a>\n  <nav>\n    <a href="index.html">${m.nav.home}</a>\n    <a href="about.html">${m.nav.about}</a>\n    <a href="contact.html">${m.nav.contact}</a>\n    <a href="privacy.html">${m.nav.privacy}</a>\n    <span class="lang-links">${LANGS.map(l => `<a href="../${l}/${path}"${l===lang?' class="active"':''}>${l.toUpperCase()}</a>`).join('')}</span>\n    <button id="themeToggle">🌙</button>\n  </nav>\n</header>`;
}

function buildFooter(c) {
  return `<footer class="site-footer"><p>© ${new Date().getFullYear()} ${c.siteName}</p></footer>\n<script src="../js/main.js"><\/script>\n</body>\n</html>`;
}

function buildAd(c) {
  if (!c.adsClient) return '';
  return `<div class="adsense-slot"><ins class="adsbygoogle" style="display:block" data-ad-client="${c.adsClient}" data-ad-slot="1234567890" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});<\/script></div>`;
}

function buildIndex(lang, c) {
  const m = LANG_META[lang];
  const tk = 'title' + lang.charAt(0).toUpperCase() + lang.slice(1);
  const cards = stories.map(s => `<article class="story-card"><a href="stories/${s.id}.html"><img src="../images/${s.cover}" alt="${s[tk]}" loading="lazy"><div class="card-body"><h3>${s[tk]}</h3><p>${s.author}</p></div></a></article>`).join('');
  return buildHead(lang, m.nav.home, c.siteName + ' - stories', 'index.html', c) + '\n' + buildHeader(lang, 'index.html', c) + `\n<main class="stories-grid"><div class="hero"><h1>${c.siteName}</h1></div><h2>${m.all}</h2><div class="grid">${cards || '<p>No stories.</p>'}</div></main>\n` + buildFooter(c);
}

function buildStory(lang, s, c) {
  const tk = 'title' + lang.charAt(0).toUpperCase() + lang.slice(1);
  const ck = 'content' + lang.charAt(0).toUpperCase() + lang.slice(1);
  const title = s[tk]; const content = s[ck]; const desc = content.slice(0, 155).replace(/\n/g, ' ');
  const paras = content.split('\n').filter(p=>p.trim()).map(p=>`<p>${p}</p>`).join('\n');
  return buildHead(lang, title, desc, `stories/${s.id}.html`, c) + '\n' + buildHeader(lang, `stories/${s.id}.html`, c) + `\n<article class="story-page"><header class="story-header"><h1>${title}</h1><p class="meta">${s.author} · ${s.date}</p><img src="../../images/${s.cover}" alt="${title}" class="story-cover"></header>${buildAd(c)}<div class="story-content">${paras}</div><nav class="story-nav"><a href="../index.html">${LANG_META[lang].back}</a></nav></article>\n` + buildFooter(c);
}

function buildStatic(lang, type, c) {
  const titles = { ar: { about: 'من نحن', contact: 'اتصل بنا', privacy: 'الخصوصية' }, en: { about: 'About', contact: 'Contact', privacy: 'Privacy' }, fr: { about: 'À propos', contact: 'Contact', privacy: 'Confidentialité' } };
  const title = titles[lang][type];
  let body = type === 'about' ? `<p>${c['about' + lang.charAt(0).toUpperCase() + lang.slice(1)]}</p>` : type === 'contact' ? `<p>Email: <a href="mailto:${c.email}">${c.email}</a></p>` : `<p>${c.siteName} uses AdSense. <br>Contact: ${c.email}</p>`;
  return buildHead(lang, title, title, type + '.html', c) + '\n' + buildHeader(lang, type + '.html', c) + `\n<article class="story-page"><h1>${title}</h1><div class="story-content">${body}</div></article>\n` + buildFooter(c);
}

// ============ التوليد والتنزيل ============
document.getElementById('generateAll').addEventListener('click', async () => {
  const c = cfg();
  const zip = new JSZip();
  
  zip.file('index.html', `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0; url=ar/index.html"></head><body><a href="ar/index.html">Continue</a></body></html>`);
  zip.file('ads.txt', `google.com, ${c.adsClient || 'pub-XXXX'}, DIRECT, f08c47fec0942fa0\n`);
  zip.file('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\n`);
  zip.file('css/style.css', CSS_CONTENT);
  zip.file('js/main.js', JS_CONTENT);

  LANGS.forEach(lang => {
    zip.file(`${lang}/index.html`, buildIndex(lang, c));
    zip.file(`${lang}/about.html`, buildStatic(lang, 'about', c));
    zip.file(`${lang}/contact.html`, buildStatic(lang, 'contact', c));
    zip.file(`${lang}/privacy.html`, buildStatic(lang, 'privacy', c));
    stories.forEach(s => zip.file(`${lang}/stories/${s.id}.html`, buildStory(lang, s, c)));
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'storydz-site.zip';
  a.click();
  alert('✅ تم توليد الموقع كاملاً.');
});

renderStoryList();
