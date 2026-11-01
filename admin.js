// ============ 1. نظام الحماية ============
const ADMIN_PASS = 'storydz2026'; 
function checkLogin() {
  if (localStorage.getItem('isAdmin') === 'true') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
  } else {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
  }
}
document.getElementById('loginBtn').addEventListener('click', () => {
  if (document.getElementById('passInput').value === ADMIN_PASS) {
    localStorage.setItem('isAdmin', 'true'); checkLogin();
  } else alert('كلمة المرور خاطئة!');
});
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('isAdmin'); checkLogin();
});

// ============ 2. قاعدة البيانات المحلية ============
let siteData = JSON.parse(localStorage.getItem('siteData') || '{"adsenseCode":"", "siteName":"StoryDZ", "stories":[]}');
function saveData() { localStorage.setItem('siteData', JSON.stringify(siteData)); renderStoryList(); }

function renderStoryList() {
  const list = document.getElementById('storyList');
  document.getElementById('storyCount').textContent = siteData.stories.length;
  if (!siteData.stories.length) { list.innerHTML = '<p style="color:#999;">لا توجد قصص بعد.</p>'; return; }
  list.innerHTML = siteData.stories.map((s, i) => `
    <div class="story-item"><span><strong>${s.titleAr}</strong></span>
    <button onclick="removeStory(${i})" style="background:#c0392b; color:#fff; border:none; padding:5px 10px; border-radius:4px;">حذف</button></div>
  `).join('');
}
window.removeStory = (i) => { siteData.stories.splice(i, 1); saveData(); };

// ============ 3. مفتاح Gemini ============
let geminiKey = localStorage.getItem('geminiKey') || '';
if (geminiKey) { document.getElementById('apiKeyInput').value = geminiKey; document.getElementById('keyStatus').textContent = '✅ محفوظ'; }
document.getElementById('saveKeyBtn').addEventListener('click', () => {
  geminiKey = document.getElementById('apiKeyInput').value.trim();
  localStorage.setItem('geminiKey', geminiKey); document.getElementById('keyStatus').textContent = '✅ تم الحفظ';
});

// ============ 4. محرك توليد الصفحات (CSS) ============
const CSS_CONTENT = `
:root { --bg:#fdfaf5; --text:#1a1a1a; --accent:#b85c38; --muted:#6b6b6b; --border:#e8e0d5; }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'Segoe UI', Tahoma, sans-serif; background:var(--bg); color:var(--text); line-height:1.8; }
a { color:var(--accent); text-decoration:none; }
.site-header { display:flex; justify-content:space-between; align-items:center; padding:1rem 2rem; border-bottom:1px solid var(--border); background:#fff; }
.logo { font-size:1.5rem; font-weight:bold; } .logo span { color:var(--accent); }
nav { display:flex; gap:1.5rem; } nav a { color:var(--text); font-weight:500; }
.hero { text-align:center; padding:4rem 2rem; background:linear-gradient(135deg, #f6efe7, #fdfaf5); }
.container { max-width:1100px; margin:0 auto; padding:3rem 2rem; }
.grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:2rem; }
.story-card { background:#fff; border:1px solid var(--border); border-radius:10px; overflow:hidden; }
.story-card img { width:100%; height:200px; object-fit:cover; }
.card-body { padding:1.2rem; } .card-body h3 { margin-bottom:0.5rem; }
article { max-width:800px; margin:2rem auto; padding:2rem; background:#fff; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.05); }
h1 { color:#222; margin-bottom:1rem; }
img { width:100%; border-radius:8px; margin-bottom:15px; }
.video-container { position:relative; padding-bottom:56.25%; height:0; overflow:hidden; margin-bottom:20px; border-radius:8px; }
.video-container iframe { position:absolute; top:0; left:0; width:100%; height:100%; }
.adsense-slot { margin: 20px auto; text-align:center; min-height:100px; }
.site-footer { text-align:center; padding:2rem; color:var(--muted); border-top:1px solid var(--border); margin-top:3rem; }
`;

function buildHead(lang, title, desc, c) {
  const ads = c.adsenseCode || '';
  return `<!DOCTYPE html>\n<html lang="${lang}" dir="${lang==='ar'?'rtl':'ltr'}">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${title}</title>\n<meta name="description" content="${desc}">\n${ads}\n<link rel="stylesheet" href="../css/style.css">\n</head>\n<body>`;
}

function buildHeader(lang, c) {
  const navText = { ar: { home: 'الرئيسية', about: 'من نحن', contact: 'اتصل بنا' }, en: { home: 'Home', about: 'About', contact: 'Contact' }, fr: { home: 'Accueil', about: 'À propos', contact: 'Contact' } };
  return `<header class="site-header"><a href="index.html" class="logo">${c.siteName || 'StoryDZ'}</a><nav><a href="index.html">${navText[lang].home}</a><a href="about.html">${navText[lang].about}</a><a href="contact.html">${navText[lang].contact}</a><span style="margin-left:15px;"><a href="../ar/index.html">AR</a> | <a href="../en/index.html">EN</a> | <a href="../fr/index.html">FR</a></span></nav></header>`;
}

function buildFooter() { return `<footer class="site-footer"><p>© 2026 ${siteData.siteName || 'StoryDZ'}</p></footer></body></html>`; }

function buildHomePage(lang, c) {
  const tk = 'title' + lang.charAt(0).toUpperCase() + lang.slice(1);
  const cards = c.stories.map(s => `<article class="story-card"><a href="stories/${s.id}.html"><img src="${s.cover}"><div class="card-body"><h3>${s[tk]}</h3><p style="color:#666;">${s.author}</p></div></a></article>`).join('');
  const adBanner = c.adsenseCode ? `<div class="adsense-slot">${c.adsenseCode}</div>` : '';
  return buildHead(lang, c.siteName, 'Home', c) + buildHeader(lang, c) + `<section class="hero"><h1>${c.siteName}</h1></section>${adBanner}<main class="container"><div class="grid">${cards}</div></main>` + buildFooter();
}

function buildAboutPage(lang, c) {
  const text = { ar: `<h1>من نحن</h1><p>نحن منصة ${c.siteName}، مبادرة تهدف إلى إحياء القصص الجزائرية والعالمية.</p>`, en: `<h1>About Us</h1><p>We are ${c.siteName}, dedicated to reviving stories.</p>`, fr: `<h1>À propos</h1><p>Nous sommes ${c.siteName}, dédiés à faire revivre les histoires.</p>` };
  return buildHead(lang, 'About', 'About', c) + buildHeader(lang, c) + `<main class="container"><article>${text[lang]}</article></main>` + buildFooter();
}

function buildContactPage(lang, c) {
  const text = { ar: `<h1>اتصل بنا</h1><p>راسلنا عبر: contact@storydz.com</p>`, en: `<h1>Contact Us</h1><p>Email: contact@storydz.com</p>`, fr: `<h1>Contact</h1><p>Email: contact@storydz.com</p>` };
  return buildHead(lang, 'Contact', 'Contact', c) + buildHeader(lang, c) + `<main class="container"><article>${text[lang]}</article></main>` + buildFooter();
}

function buildStory(lang, s, c) {
  const tk = 'title' + lang.charAt(0).toUpperCase() + lang.slice(1);
  const ck = 'content' + lang.charAt(0).toUpperCase() + lang.slice(1);
  let videoHtml = '';
  if (s.videoUrl) {
    let vidId = s.videoUrl.includes('v=') ? s.videoUrl.split('v=')[1].split('&')[0] : s.videoUrl.split('/').pop();
    videoHtml = `<div class="video-container"><iframe src="https://www.youtube.com/embed/${vidId}" allowfullscreen></iframe></div>`;
  }
  const paragraphs = s[ck] ? s[ck].split('\n').map(p=>`<p>${p}</p>`).join('') : '';
  const adMid = c.adsenseCode ? `<div class="adsense-slot">${c.adsenseCode}</div>` : '';
  return buildHead(lang, s[tk], s[ck]?.slice(0,150) || '', c) + buildHeader(lang, c) + `<main class="container"><article><h1>${s[tk]}</h1><p style="color:#666;">${s.author} · ${s.date}</p>${s.cover ? `<img src="${s.cover}">` : ''}${videoHtml}${paragraphs}${adMid}</article></main>` + buildFooter();
}

// دالة التوليد والتنزيل
async function generateAndDownload(typesToGenerate) {
  const zip = new JSZip();
  zip.file('css/style.css', CSS_CONTENT);
  
  ['ar', 'en', 'fr'].forEach(lang => {
    if (typesToGenerate.includes('home')) zip.file(`${lang}/index.html`, buildHomePage(lang, siteData));
    if (typesToGenerate.includes('about')) zip.file(`${lang}/about.html`, buildAboutPage(lang, siteData));
    if (typesToGenerate.includes('contact')) zip.file(`${lang}/contact.html`, buildContactPage(lang, siteData));
    if (typesToGenerate.includes('stories')) {
      siteData.stories.forEach(s => zip.file(`${lang}/stories/${s.id}.html`, buildStory(lang, s, siteData)));
    }
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'storydz-pages.zip';
  a.click();
}

// ============ 5. الشات الذكي (ينشئ الصفحات ويعدل الموقع) ============
document.getElementById('askAiBtn').addEventListener('click', async () => {
  if (!geminiKey) return alert('أدخل مفتاح Gemini أولاً.');
  const prompt = document.getElementById('aiPrompt').value;
  if (!prompt) return alert('اكتب أمرك للمساعد أولاً');
  
  const status = document.getElementById('aiStatus');
  status.textContent = '⏳ جاري تنفيذ الأمر...';
  status.style.color = '#2196f3';
  
  // تعليمات صارمة للذكاء الاصطناعي ليفهم الأوامر
  const context = `أنت مدير ذكي لموقع قصص. بيانات الموقع: ${JSON.stringify(siteData)}.
أمر المستخدم: "${prompt}".
يجب أن ترد بصيغة JSON صالحة فقط تحتوي على "action" و "data".
الأوامر الممكنة (action):
- "generate_home": لتوليد الصفحة الرئيسية (data: {})
- "generate_about": لتوليد صفحة من نحن (data: {})
- "generate_contact": لتوليد صفحة اتصل بنا (data: {})
- "generate_all": لتوليد كل الموقع (data: {})
- "add_story": لإضافة قصة (data: {id, titleAr, titleEn, titleFr, contentAr, contentEn, contentFr, author, cover})
- "delete_story": لحذف قصة (data: {id})
- "edit_story": لتعديل قصة (data: {id, field, newValue})
- "add_adsense": لإضافة كود AdSense (data: {code})
- "update_config": لتحديث إعدادات الموقع (data: {field, value})
لا تكتب أي شيء آخر خارج الـ JSON.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: context }] }], generationConfig: { responseMimeType: "application/json" } })
    });
    
    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text;
    const actionData = JSON.parse(aiText);
    
    // تنفيذ الأوامر
    if (actionData.action === 'generate_home' || actionData.action === 'generate_about' || actionData.action === 'generate_contact') {
      const type = actionData.action.split('_')[1];
      await generateAndDownload([type]);
      status.textContent = `✅ تم توليد صفحة (${type}) وتنزيلها كـ ZIP. قم برفعها إلى GitHub.`;
    } 
    else if (actionData.action === 'generate_all') {
      await generateAndDownload(['home', 'about', 'contact', 'stories']);
      status.textContent = '✅ تم توليد الموقع بالكامل وتنزيله.';
    }
    else if (actionData.action === 'add_story') {
      siteData.stories.push(actionData.data); saveData();
      status.textContent = '✅ تمت إضافة القصة الجديدة.';
    } 
    else if (actionData.action === 'delete_story') {
      siteData.stories = siteData.stories.filter(s => s.id !== actionData.data.id); saveData();
      status.textContent = '✅ تم حذف القصة.';
    }
    else if (actionData.action === 'edit_story') {
      let s = siteData.stories.find(st => st.id === actionData.data.id);
      if (s) { s[actionData.data.field] = actionData.data.newValue; saveData(); status.textContent = '✅ تم التعديل.'; }
    }
    else if (actionData.action === 'add_adsense') {
      siteData.adsenseCode = actionData.data.code; saveData();
      status.textContent = '✅ تم إضافة كود AdSense. سيتم تضمينه عند التوليد.';
    }
    else {
      status.textContent = '⚠️ لم أفهم الأمر، جرب: "أنشئ الصفحة الرئيسية" أو "أضف قصة".';
    }
    
    status.style.color = '#22c55e';
    document.getElementById('aiPrompt').value = '';
  } catch (err) {
    status.textContent = '❌ حدث خطأ: ' + err.message;
    status.style.color = '#c0392b';
  }
});

// ============ 6. التوليد اليدوي (الزر القديم) ============
document.getElementById('generateAll').addEventListener('click', () => generateAndDownload(['home', 'about', 'contact', 'stories']));
document.getElementById('storyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  siteData.stories.push({ id: 'story-' + (siteData.stories.length + 1), titleAr: document.getElementById('titleAr').value, titleEn: document.getElementById('titleEn').value, titleFr: document.getElementById('titleFr').value, author: document.getElementById('author').value || 'StoryDZ', cover: document.getElementById('cover').value || 'https://via.placeholder.com/800x400', videoUrl: document.getElementById('videoUrl').value, contentAr: document.getElementById('contentAr').value, contentEn: document.getElementById('contentEn').value, contentFr: document.getElementById('contentFr').value, date: new Date().toISOString().slice(0, 10) });
  saveData(); e.target.reset(); alert('✅ تمت الإضافة.');
});

checkLogin();
renderStoryList();
