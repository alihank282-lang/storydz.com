// ============ 1. نظام الحماية بكلمة المرور ============
const ADMIN_PASS = 'storydz2026'; // يمكنك تغييرها من هنا

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
  const pass = document.getElementById('passInput').value;
  if (pass === ADMIN_PASS) {
    localStorage.setItem('isAdmin', 'true');
    checkLogin();
  } else {
    alert('كلمة المرور خاطئة!');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('isAdmin');
  checkLogin();
});

checkLogin(); // تشغيل عند فتح الصفحة

// ============ 2. إعدادات مفتاح Gemini ============
const apiKeyInput = document.getElementById('apiKeyInput');
const keyStatus = document.getElementById('keyStatus');
let geminiKey = localStorage.getItem('geminiKey') || '';

if (geminiKey) {
  apiKeyInput.value = geminiKey;
  keyStatus.textContent = '✅ المفتاح محفوظ وجاهز.';
}

document.getElementById('saveKeyBtn').addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key) return alert('أدخل المفتاح أولاً');
  localStorage.setItem('geminiKey', key);
  geminiKey = key;
  keyStatus.textContent = '✅ تم حفظ المفتاح في هذا الجهاز.';
});

// ============ 3. الشات الذكي (اتصال مباشر بـ Gemini) ============
document.getElementById('askAiBtn').addEventListener('click', async () => {
  if (!geminiKey) return alert('يرجى إدخال وحفظ مفتاح Gemini أولاً في الأعلى.');
  
  const prompt = document.getElementById('aiPrompt').value;
  if (!prompt) return alert('اكتب أمرك للمساعد أولاً');
  
  const status = document.getElementById('aiStatus');
  status.textContent = '⏳ جاري التفكير وكتابة القصة...';
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `أنت مساعد لكتابة القصص. أجب بصيغة JSON فقط (بدون أي كلام إضافي) تحتوي على الحقول التالية: titleAr, titleEn, titleFr, contentAr, contentEn, contentFr. القصة المطلوبة: ${prompt}` }]
        }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    
    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text;
    const jsonData = JSON.parse(aiText);
    
    // ملء الحقول
    document.getElementById('titleAr').value = jsonData.titleAr || '';
    document.getElementById('titleEn').value = jsonData.titleEn || '';
    document.getElementById('titleFr').value = jsonData.titleFr || '';
    document.getElementById('contentAr').value = jsonData.contentAr || '';
    document.getElementById('contentEn').value = jsonData.contentEn || '';
    document.getElementById('contentFr').value = jsonData.contentFr || '';
    
    status.textContent = '✅ تمت الكتابة! راجع النص واضغط حفظ.';
  } catch (err) {
    status.textContent = '❌ حدث خطأ: ' + err.message;
  }
});

// ============ 4. إدارة القصص ============
let stories = JSON.parse(localStorage.getItem('stories') || '[]');
function val(id) { return document.getElementById(id).value.trim(); }

function saveState() {
  localStorage.setItem('stories', JSON.stringify(stories));
  renderStoryList();
}

function renderStoryList() {
  const list = document.getElementById('storyList');
  document.getElementById('storyCount').textContent = stories.length;
  if (!stories.length) { list.innerHTML = '<p style="color:#999;">لا توجد قصص بعد.</p>'; return; }
  list.innerHTML = stories.map((s, i) => `
    <div class="story-item">
      <span><strong>${s.titleAr}</strong></span>
      <button onclick="removeStory(${i})" style="background:#c0392b; color:#fff; border:none; padding:5px 10px; border-radius:4px;">حذف</button>
    </div>
  `).join('');
}
window.removeStory = (i) => { stories.splice(i, 1); saveState(); };

document.getElementById('storyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const s = {
    id: 'story-' + String(stories.length + 1).padStart(2, '0'),
    titleAr: val('titleAr'), titleEn: val('titleEn') || val('titleAr'), titleFr: val('titleFr') || val('titleAr'),
    author: val('author') || 'StoryDZ', cover: val('cover') || 'https://via.placeholder.com/800x400?text=Story', videoUrl: val('videoUrl'),
    contentAr: val('contentAr'), contentEn: val('contentEn') || val('contentAr'), contentFr: val('contentFr') || val('contentAr'),
    date: new Date().toISOString().slice(0, 10)
  };
  stories.push(s);
  saveState();
  e.target.reset();
  alert('✅ تم حفظ القصة.');
});

// ============ 5. توليد الموقع (ZIP) ============
const CSS_CONTENT = `
body { font-family: 'Segoe UI', Tahoma, sans-serif; background:#f9f9f9; color:#333; margin:0; padding:0; }
.site-header { background:#fff; padding:15px 20px; display:flex; justify-content:space-between; border-bottom:1px solid #ddd; }
.site-header a { text-decoration:none; color:#b85c38; font-weight:bold; font-size:1.2rem; }
article { max-width:800px; margin: 20px auto; padding: 20px; background:#fff; border-radius:10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
h1 { color: #222; }
img { width: 100%; border-radius: 8px; margin-bottom: 15px; }
.video-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin-bottom: 20px; }
.video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.site-footer { text-align:center; padding: 20px; color:#777; }
`;

const JS_CONTENT = `console.log('StoryDZ Loaded');`;

function buildHead(lang, title, desc, path, c) {
  const ads = c.adsClient ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${c.adsClient}" crossorigin="anonymous"><\/script>` : '';
  return `<!DOCTYPE html>\n<html lang="${lang}" dir="${lang==='ar'?'rtl':'ltr'}">\n<head>\n<meta charset="UTF-8">\n<title>${title}</title>\n<meta name="description" content="${desc}">\n${ads}\n<link rel="stylesheet" href="../css/style.css">\n</head>\n<body>`;
}

function buildHeader(lang, path, c) {
  return `<header class="site-header"><a href="index.html">${c.siteName}</a><nav><a href="index.html">Home</a> | <a href="../ar/${path}">AR</a> <a href="../en/${path}">EN</a> <a href="../fr/${path}">FR</a></nav></header>`;
}

function buildFooter() { return `<footer class="site-footer"><p>© StoryDZ - جميع الحقوق محفوظة</p></footer></body></html>`; }

function buildStory(lang, s, c) {
  const tk = 'title' + lang.charAt(0).toUpperCase() + lang.slice(1);
  const ck = 'content' + lang.charAt(0).toUpperCase() + lang.slice(1);
  let videoHtml = '';
  if (s.videoUrl) {
    // استخراج كود الفيديو من يوتيوب بشكل ذكي
    let vidId = s.videoUrl;
    if (vidId.includes('v=')) vidId = vidId.split('v=')[1].split('&')[0];
    else if (vidId.includes('youtu.be/')) vidId = vidId.split('youtu.be/')[1].split('?')[0];
    
    videoHtml = `<div class="video-container"><iframe src="https://www.youtube.com/embed/${vidId}" frameborder="0" allowfullscreen></iframe></div>`;
  }
  
  const paragraphs = s[ck].split('\n').filter(p=>p.trim()).map(p=>`<p>${p}</p>`).join('');
  
  return buildHead(lang, s[tk], s[ck].slice(0,150), `stories/${s.id}.html`, c) + 
    buildHeader(lang, `stories/${s.id}.html`, c) + 
    `<article>
      <h1>${s[tk]}</h1>
      <p style="color:#666;">${s.author} · ${s.date}</p>
      ${s.cover ? `<img src="${s.cover}" alt="${s[tk]}">` : ''}
      ${videoHtml}
      <div style="font-size:1.15rem; line-height:1.8;">${paragraphs}</div>
    </article>` + buildFooter();
}

document.getElementById('generateAll').addEventListener('click', async () => {
  if(!stories.length) return alert('أضف قصة واحدة على الأقل أولاً.');
  const c = { siteName: val('siteName'), domain: val('domain'), adsClient: val('adsenseClient') };
  const zip = new JSZip();
  
  zip.file('css/style.css', CSS_CONTENT);
  zip.file('js/main.js', JS_CONTENT);

  ['ar', 'en', 'fr'].forEach(lang => {
    stories.forEach(s => zip.file(`${lang}/stories/${s.id}.html`, buildStory(lang, s, c)));
    // إنشاء صفحة رئيسية بسيطة لكل لغة
    const indexHtml = buildHead(lang, c.siteName, 'Stories', 'index.html', c) + buildHeader(lang, 'index.html', c) + `<main style="padding:20px; text-align:center;"><h1>مرحباً بكم في ${c.siteName}</h1><p>تصفح القصص من القائمة.</p></main>` + buildFooter();
    zip.file(`${lang}/index.html`, indexHtml);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'storydz-site.zip';
  a.click();
});

renderStoryList();
