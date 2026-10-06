const body = document.body;
const main = document.querySelector('main');
const navigation = document.querySelector('nav');
const hero = document.querySelector('.hero');
if (hero && !hero.querySelector('.hero-canvas')) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);
  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: .5, y: .5 };
  let particles = [];
  let frame = 0;
  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = hero.clientWidth * ratio;
    canvas.height = hero.clientHeight * ratio;
    canvas.style.width = `${hero.clientWidth}px`;
    canvas.style.height = `${hero.clientHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const columns = Math.ceil(hero.clientWidth / 82) + 1;
    const rows = Math.ceil(hero.clientHeight / 82) + 1;
    particles = Array.from({ length: columns * rows }, (_, index) => ({
      x: (index % columns) * 82 - 20,
      y: Math.floor(index / columns) * 82 - 20,
      phase: Math.random() * Math.PI * 2
    }));
  };
  const draw = (time = 0) => {
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    context.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
      const drift = reducedMotion.matches ? 0 : Math.sin(time * .00045 + particle.phase) * 8;
      const x = particle.x + (pointer.x - .5) * 18 + drift;
      const y = particle.y + (pointer.y - .5) * 18 + Math.cos(time * .00035 + particle.phase) * 8;
      context.fillStyle = particle.phase % 3 > 1.8 ? 'rgba(223,99,65,.48)' : 'rgba(38,38,38,.18)';
      context.fillRect(x, y, 2, 2);
      context.beginPath();
      context.strokeStyle = 'rgba(38,38,38,.08)';
      context.moveTo(x, y);
      context.lineTo(x + 82, y);
      context.stroke();
    });
    if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
  };
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    pointer.x = (event.clientX - bounds.left) / bounds.width;
    pointer.y = (event.clientY - bounds.top) / bounds.height;
  }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  reducedMotion.addEventListener?.('change', () => {
    cancelAnimationFrame(frame);
    draw();
  });
  resize();
  draw();
}
if (navigation) navigation.setAttribute('aria-label', '主要导航');
document.querySelectorAll('button').forEach(button => button.type = 'button');
const filterGroups = [
  { node: document.querySelector('.experience .tabs'), label: ['筛选经历', 'Filter experience'] },
  { node: document.querySelector('.portfolio-tabs'), label: ['筛选作品集', 'Filter portfolio'] }
].filter(group => group.node);
filterGroups.forEach(({ node, label }) => {
  node.setAttribute('role', 'group');
  node.setAttribute('aria-label', label[0]);
  node.querySelectorAll('button').forEach(button => {
    button.removeAttribute('role');
    button.removeAttribute('aria-selected');
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  });
});
const modelViewer = document.querySelector('.hero-model-placeholder model-viewer');
const modelMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (modelViewer && modelMotion.matches) modelViewer.removeAttribute('auto-rotate');
modelMotion.addEventListener?.('change', (event) => {
  if (!modelViewer) return;
  if (event.matches) modelViewer.removeAttribute('auto-rotate');
  else modelViewer.setAttribute('auto-rotate', '');
});
if (main && !document.querySelector('.skip-link')) {
  const skipLink = document.createElement('a');
  skipLink.className = 'skip-link';
  skipLink.href = `#${main.id || 'main-content'}`;
  skipLink.textContent = '跳到主内容';
  if (!main.id) main.id = 'main-content';
  main.tabIndex = -1;
  document.body.prepend(skipLink);
}
const languageButton = document.querySelector('#lang-toggle');
const themeButton = document.querySelector('#theme');
let language = 'zh';
const data = {
  zh: { nav: ['简介', '经历', '能力'], button: '下载 CV ↗', hero: ['把复杂信息，变成', '值得被看见的表达。', '跨越艺术现场\n与商业现场', '艺术科技 × 商业 × 媒体', 'Scroll to explore　↓'], profile: ['复合型\n表达者。', '现就读于香港岭南大学艺术科技与商业理学硕士，系统接触数字艺术、文化产业管理、艺术金融与商业创新。', '从专业出镜、声音表达，到电商直播与内容运营，我擅长将专业信息转译成高传播力叙事，再让叙事产生可衡量的商业结果。', ['单月直播 GMV / HKD', '活动参会者满意度', '口才课程授课课时', '内容点击率提升']], exp: { tabs: ['全部', '工作', '项目'], roles: ['电商运营 / 直播主播', '活动主持人', '出镜模特 / 商业口播', '摄制部副部长', '实习记者'], places: ['佛山 · 高端家电全品类', '广州 · 秋季投资策略报告会', '武汉 / 广州 · 湖北电视台、光谷泛悦城等', '武汉 · 校园官方媒体', '广东 · 新闻采编与新媒体转化'], details: ['深度调研产品与高净值客群需求，设计差异化讲解逻辑；推动单月 GMV 突破 50 万港元，单场转化率提升 15%–20%，搭建可复制的运营方法论。', '独立主持大型投资策略报告会，统筹策划到执行全流程；拆解复杂金融信息，会议获 95% 参会者满意度。', '完成宣传片出镜与商业口播，优化表达与呈现策略，助力合作项目传播效果提升 30%。', '运营校园官方新媒体账号，内容点击率提升 35%；48 小时响应热搜，单篇转发破 5000+。', '参与采编、文稿、后期剪辑及新媒体转化全流程，带动媒体账号单日涨粉 15%。'] }, cap: ['我如何\n创造价值。', '从洞察到表达，再从表达回到数据。', ['艺术科技', '商业运营', '媒体传播', '语言与工具'], ['数字策展 · 互动媒体 · 文化创新\nNFT 与数字艺术 · 艺术市场分析', '电商运营 · 品牌叙事 · 内容商业化\n数据驱动策略 · 用户增长', '直播带货 · 出镜主持 · 配音旁白\n脚本撰写 · 视频制作 · 多平台运营', '粤语（母语） · 普通话（一级乙等）\n英语（IELTS 6.0） · Premiere · AU · Canva · Figma · Photopea']], edu: ['艺术科技与商业硕士', '香港岭南大学 · 2026.09 — 2027.11（预计）', '艺术金融与科技、互动艺术与科技、文化市场营销、数字策展、创意经济', '播音与主持艺术学士', '武汉传媒学院 · 2021.09 — 2025.06', 'GPA 3.8 / 4.0 · 专业前 5% · 每学年校级奖学金'], contact: ['让下一段经历\n从一句你好开始。', '复制邮箱 ↗', '回到顶部 ↑'] },
  en: { nav: ['Profile', 'Experience', 'Capabilities'], button: 'Download CV ↗', hero: ['Turning complex ideas into', 'stories worth seeing.', 'Bridging art spaces\nand business worlds', 'Arts Tech × Business × Media', 'Scroll to explore　↓'], profile: ['Cross-disciplinary\ncommunicator.', 'Currently pursuing an MSc in Arts Technology and Business at Lingnan University, combining digital art, cultural management, art finance, and business innovation.', 'From on-camera hosting and voice work to livestream operations and content production, I turn complex information into compelling narratives and measurable commercial outcomes.', ['Monthly livestream GMV / HKD', 'Event attendee satisfaction', 'Public-speaking teaching hours', 'Content click-through improvement']], exp: { tabs: ['All', 'Work', 'Projects'], roles: ['E-commerce Operations / Livestream Host', 'Event Host & Master of Ceremonies', 'On-Camera Talent / Commercial Voiceover', 'Deputy Head, Video Production Department', 'Intern Journalist'], places: ['Foshan · Premium home appliances', 'Guangzhou · Autumn Investment Strategy Conference', 'Wuhan / Guangzhou · Hubei TV, Optics Valley Pan Yue City, and more', 'Wuhan · Campus media', 'Guangdong · News production and digital adaptation'], details: ['Conducted product and audience research, designed differentiated sales narratives, drove monthly GMV above HK$500K, improved per-session conversion by 15%–20%, and built replicable operating frameworks.', 'Led an end-to-end investment strategy conference, translated complex financial concepts for high-value clients, and achieved 95% attendee satisfaction.', 'Delivered promotional videos and commercial voiceovers, improving partner campaign communication effectiveness by 30%.', 'Operated the official campus media account, increased click-through by 35%, and produced rapid-response content within 48 hours with over 5,000 shares per post.', 'Worked across reporting, scripting, editing, and digital adaptation, driving 15% single-day follower growth for the station account.'] }, cap: ['How I\ncreate value.', 'From insight to expression, then back to data.', ['Arts Technology', 'Business & Marketing', 'Media & Communication', 'Languages & Tools'], ['Digital curation · Interactive media · Cultural innovation\nNFT & digital art · Art market analysis', 'E-commerce operations · Brand storytelling · Content commercialization\nData-driven strategy · User growth', 'Live broadcasting · On-camera hosting · Voiceover\nScriptwriting · Video production · Multi-platform content', 'Cantonese (native) · Mandarin (Level 1-B)\nEnglish (IELTS 6.0) · Premiere · AU · Canva · Figma · Photopea']], edu: ['MSc in Arts Technology and Business', 'Lingnan University · 2026.09 — 2027.11 (Expected)', 'Art Finance & Technology, Interactive Art & Technology, Cultural Marketing, Digital Curation, Creative Economy', 'BA in Broadcasting and Hosting Art', 'Wuhan Media and Communications College · 2021.09 — 2025.06', 'GPA 3.8 / 4.0 · Top 5% of cohort · University scholarship every academic year'], contact: ['Let the next chapter\nstart with hello.', 'Copy email ↗', 'Back to top ↑'] }
};
function setText(selector, text) { const node = document.querySelector(selector); if (node) node.textContent = text; }
data.zh.nav = ['简介', '经历', '作品集', '能力']; data.en.nav = ['Profile', 'Experience', 'Portfolio', 'Capabilities'];
data.zh.button = '打印 / 保存 CV ↗'; data.en.button = 'Print / Save CV ↗';
setText('#print', data.zh.button);
const portfolioIndex = document.querySelector('.portfolio .index');
if (portfolioIndex?.firstChild) portfolioIndex.firstChild.textContent = '06 ';
const portfolioData = [
  { type: 'commercial', year: '2022 — 2026', color: 'ink', zh: { tag: '商业｜政府｜艺术策展', title: '活动主持', summary: '独立统筹各种大型主持活动，覆盖政府、企业、商业与艺术策展现场。', metric: '全案', metricLabel: '策划 · 文稿 · 控场', detail: '可独立完成全案策划、文稿撰写与现场控场，擅长多方协调与临场应变，以专业表达输出价值，提升品牌影响力。' }, en: { tag: 'COMMERCIAL | GOVERNMENT | ARTS', title: 'Event Hosting & MC', summary: 'Independently coordinating large-scale events across government, business, commercial, and arts contexts.', metric: '360°', metricLabel: 'planning to stage', detail: 'Handling end-to-end planning, scripts, stakeholder coordination, and live-room control with agility and professional value that strengthens brand impact.' }, href: 'research.html' },
  { type: 'commercial', year: '2025', color: 'coral', zh: { tag: '商业运营', title: 'COLMO 高端家电直播增长', summary: '把复杂产品参数转化为高净值客群听得懂、愿意行动的购买叙事。', metric: 'HK$500K+', metricLabel: '单月 GMV', detail: '从客群洞察、脚本设计到直播复盘建立可复制的方法论，单场转化率提升 15%–20%。' }, en: { tag: 'COMMERCIAL', title: 'COLMO Livestream Growth', summary: 'Turning complex product specifications into a purchase narrative for high-value audiences.', metric: 'HK$500K+', metricLabel: 'monthly GMV', detail: 'Built a repeatable framework from audience insight and scripting to live-session reviews, lifting conversion by 15%–20%.' } },
  { type: 'media', year: '2024', color: 'lime', zh: { tag: '媒体传播', title: '华媒青年报 · 热点内容系统', summary: '用更快的响应与更清晰的视觉叙事，让校园媒体成为可持续的内容品牌。', metric: '35%', metricLabel: '点击率提升', detail: '负责选题、拍摄、剪辑与分发，48 小时内完成热点内容响应，单篇转发破 5000+。' }, en: { tag: 'MEDIA', title: 'Huamei Youth · Newsroom System', summary: 'Building a sustainable campus media brand through faster response and clearer visual storytelling.', metric: '35%', metricLabel: 'CTR improvement', detail: 'Led topics, production, editing, and distribution; delivered rapid-response stories within 48 hours with 5,000+ shares per post.' } },
  { type: 'art-tech', year: '2026', color: 'ink', zh: { tag: '艺术科技', title: '数字策展与文化创新研究', summary: '在艺术、科技与商业之间搭建新的观看与参与方式。', metric: '03', metricLabel: '核心视角', detail: '围绕数字策展、互动艺术与文化市场营销展开研究，把抽象概念整理成可沟通、可执行的体验框架。' }, en: { tag: 'ARTS TECH', title: 'Digital Curation & Cultural Innovation', summary: 'Creating new ways to experience and participate across art, technology, and business.', metric: '03', metricLabel: 'core lenses', detail: 'Researching digital curation, interactive art, and cultural marketing, translating abstract ideas into communicable experience frameworks.' }, href: 'digital-curation.html' }
];
function renderPortfolio() {
  const grid = document.querySelector('#portfolio-grid');
  if (!grid) return;
  const filter = document.querySelector('.portfolio-tabs .active')?.dataset.workFilter || 'all';
  const locale = language === 'zh' ? 'zh' : 'en';
  grid.innerHTML = portfolioData.filter(item => filter === 'all' || item.type === filter).map((item, index) => { const content = item[locale]; return `<article class="portfolio-card portfolio-${item.color}" data-work-type="${item.type}" style="--delay:${index * 80}ms"><div class="portfolio-art"><span>${item.year}</span><b>${String(index + 1).padStart(2, '0')}</b><i></i></div><div class="portfolio-card-body"><div class="portfolio-meta"><label>${content.tag}</label><span>${item.type.replace('-', ' / ')}</span></div><h3>${content.title}</h3><p>${content.summary}</p>${item.href ? `<a class="portfolio-open" href="${item.href}">${language === 'zh' ? '进入研究页面' : 'Open research page'} ↗</a>` : ''}<div class="portfolio-result"><strong>${content.metric}</strong><span>${content.metricLabel}</span></div><details><summary>${language === 'zh' ? '查看项目说明' : 'View project note'} <span>↗</span></summary><p>${content.detail}</p></details></div></article>`; }).join('');
}
const englishAwards = ['Excellence Award, National College Student Advertising Art Competition (Maker Marketing Category)', '2nd Prize, China University Student Computer Design Competition (Central-South Region)', '2nd Prize, Lei Feng Cup Recitation Competition', '3rd Prize, Hubei Province Translation Competition', '3rd Prize, Hope Star English Talent Competition (City Speech)', '2nd Prize, FLTRP · Guocai Cup English Speaking Competition', '3rd Prize, FLTRP · Guocai Cup National Reading Competition', '1st Prize, Tell Hometown Stories in English Competition', '2nd Prize, Youth in Volunteer Stories Speech Competition', '2nd Prize, FLTRP · Guocai Cup National English Speech Competition'];
const chineseAwards = Array.from(document.querySelectorAll('.awards li')).map(node => node.lastChild.textContent);
function applyLanguage() {
  const t = data[language]; document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'; document.title = language === 'zh' ? 'Kasey 梁幸琪 · Interactive CV' : 'Kasey Liang · Interactive CV';
  navigation?.setAttribute('aria-label', language === 'zh' ? '主要导航' : 'Main navigation');
  themeButton?.setAttribute('aria-label', language === 'zh' ? '切换明暗主题' : 'Toggle light and dark theme');
  languageButton.setAttribute('aria-label', language === 'zh' ? '切换英文' : 'Switch to Chinese');
  filterGroups.forEach(({ node, label }) => node.setAttribute('aria-label', label[language === 'zh' ? 0 : 1]));
  document.querySelectorAll('nav a').forEach((node, index) => node.textContent = t.nav[index]); setText('#print', t.button); document.querySelector('.lede').innerHTML = `${t.hero[0]}<br><strong>${t.hero[1]}</strong>`; setText('.visual-caption', t.hero[2]); setText('.meta span:nth-child(2)', t.hero[3]); setText('.scroll', t.hero[4]); setText('[data-i18n="proof-gmv"]', language === 'zh' ? '单月直播 GMV' : 'Monthly livestream GMV'); setText('[data-i18n="proof-conversion"]', language === 'zh' ? '单场转化率提升' : 'Per-session conversion lift'); setText('[data-i18n="proof-satisfaction"]', language === 'zh' ? '活动满意度' : 'Event satisfaction'); setText('[data-i18n="results-kicker"]', language === 'zh' ? 'WORK RESULTS / 工作成果' : 'WORK RESULTS / OUTCOMES');
  document.querySelector('.profile h2').innerHTML = `${t.profile[0].replace('\n', '<br>')}`; setText('.profile-grid > div p:nth-child(1)', t.profile[1]); setText('.profile-grid > div p:nth-child(2)', t.profile[2]); document.querySelectorAll('.stats span').forEach((node, index) => node.textContent = t.profile[3][index]);
  document.querySelectorAll('.experience .tabs button').forEach((node, index) => node.textContent = t.exp.tabs[index]); document.querySelectorAll('.portfolio-tabs button').forEach((node, index) => node.textContent = language === 'zh' ? ['全部', '商业', '媒体', '艺术科技'][index] : ['All', 'Commercial', 'Media', 'Arts Tech'][index]); setText('[data-i18n="portfolio-kicker"]', language === 'zh' ? 'PORTFOLIO / 作品集' : 'PORTFOLIO / SELECTED WORK'); document.querySelectorAll('.timeline article').forEach((article, index) => { setText(`.timeline article:nth-child(${index + 1}) label`, t.exp.roles[index]); setText(`.timeline article:nth-child(${index + 1}) .muted`, t.exp.places[index]); setText(`.timeline article:nth-child(${index + 1}) .detail`, t.exp.details[index]); });
  const capTitle = t.cap[0].split('\n'); document.querySelector('.cap-grid h2').innerHTML = `${capTitle[0]}<br><em>${capTitle[1]}</em>`; setText('.cap-grid > div > p', t.cap[1]); document.querySelectorAll('.cap-list h3').forEach((node, index) => node.textContent = t.cap[2][index]); document.querySelectorAll('.cap-list p').forEach((node, index) => node.textContent = t.cap[3][index]);
  ['.edu-grid > div:first-child h3:nth-of-type(1)', '.edu-grid > div:first-child p:nth-of-type(1)', '.edu-grid > div:first-child small:nth-of-type(1)', '.edu-grid > div:first-child h3:nth-of-type(2)', '.edu-grid > div:first-child p:nth-of-type(2)', '.edu-grid > div:first-child small:nth-of-type(2)'].forEach((selector, index) => setText(selector, t.edu[index])); document.querySelectorAll('.awards li').forEach((node, index) => { node.lastChild.textContent = language === 'en' ? englishAwards[index] : chineseAwards[index]; }); const contactTitle = t.contact[0].split('\n'); document.querySelector('.contact h2').innerHTML = `${contactTitle[0]}<br><em>${contactTitle[1]}</em>`; setText('#copy span', t.contact[1]); setText('.contact footer a', t.contact[2]); languageButton.textContent = language === 'zh' ? 'EN' : '中';
}
languageButton.addEventListener('click', () => { language = language === 'zh' ? 'en' : 'zh'; applyLanguage(); renderPortfolio(); });
document.querySelectorAll('.portfolio-tabs button').forEach(tab => tab.addEventListener('click', () => { document.querySelectorAll('.portfolio-tabs button').forEach(item => { item.classList.remove('active'); item.setAttribute('aria-pressed', 'false'); }); tab.classList.add('active'); tab.setAttribute('aria-pressed', 'true'); renderPortfolio(); }));
renderPortfolio();
themeButton.addEventListener('click', () => { body.classList.toggle('dark'); themeButton.textContent = body.classList.contains('dark') ? '☼' : '◐'; }); document.querySelector('#print').addEventListener('click', () => window.print());
const toast = document.querySelector('.toast'); document.querySelector('#copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText('2578157551@qq.com'); } catch { const helper = document.createElement('textarea'); helper.value = '2578157551@qq.com'; helper.style.position = 'fixed'; helper.style.opacity = '0'; document.body.appendChild(helper); helper.select(); document.execCommand('copy'); helper.remove(); } toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); });
document.querySelectorAll('.plus').forEach(button => { const article = button.closest('article'); const detail = article.querySelector('.detail'); detail.hidden = true; button.setAttribute('aria-expanded', 'false'); button.addEventListener('click', () => { const open = article.classList.toggle('open'); detail.hidden = !open; button.setAttribute('aria-expanded', open); button.setAttribute('aria-label', open ? '收起详情' : '展开详情'); button.textContent = open ? '−' : '+'; }); }); document.querySelectorAll('.experience .tabs button').forEach(tab => tab.addEventListener('click', () => { document.querySelectorAll('.experience .tabs button').forEach(item => { item.classList.remove('active'); item.setAttribute('aria-pressed', 'false'); }); tab.classList.add('active'); tab.setAttribute('aria-pressed', 'true'); const filter = tab.dataset.filter; document.querySelectorAll('.timeline article').forEach(item => item.classList.toggle('hidden', filter !== 'all' && item.dataset.type !== filter)); }));

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .14, rootMargin: '0px 0px -8% 0px' });
const observeRevealNodes = () => {
  document.querySelectorAll('.divider, .contact, .timeline article, .cap-list > div, .portfolio-card, .edu-grid > div').forEach((node) => {
    if (!node.dataset.revealBound) {
      node.dataset.revealBound = 'true';
      revealObserver.observe(node);
    }
  });
};
observeRevealNodes();
const portfolioObserver = new MutationObserver(observeRevealNodes);
const portfolioGrid = document.querySelector('#portfolio-grid');
if (portfolioGrid) portfolioObserver.observe(portfolioGrid, { childList: true });

const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
progressBar.setAttribute('aria-hidden', 'true');
document.body.append(progressBar);
const updateScrollState = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.setProperty('--scroll-progress', `${progress * 100}%`);
  document.querySelector('header')?.classList.toggle('is-scrolled', window.scrollY > 24);
};
window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

const sectionLinks = [...document.querySelectorAll('nav a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    sectionLinks.forEach((link) => link.classList.toggle('is-current', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-42% 0px -48% 0px', threshold: 0 });
document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));

const visual = document.querySelector('.visual');
if (visual && !motionPreference.matches && window.matchMedia('(pointer: fine)').matches) {
  visual.addEventListener('pointermove', (event) => {
    const bounds = visual.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    visual.style.setProperty('--visual-x', `${x * 10}px`);
    visual.style.setProperty('--visual-y', `${y * 10}px`);
    if (modelViewer?.loaded) {
      modelViewer.removeAttribute('auto-rotate');
      const yaw = x * 14;
      const pitch = 75 - y * 10;
      modelViewer.cameraOrbit = `${yaw.toFixed(2)}deg ${pitch.toFixed(2)}deg auto`;
    }
  }, { passive: true });
  visual.addEventListener('pointerleave', () => {
    visual.style.setProperty('--visual-x', '0px');
    visual.style.setProperty('--visual-y', '0px');
    if (modelViewer?.loaded) {
      modelViewer.cameraOrbit = '0deg 75deg auto';
      if (!modelMotion.matches) modelViewer.setAttribute('auto-rotate', '');
    }
  }, { passive: true });
}

const capabilityFeature = document.querySelector('.cap-feature');
const capabilityModel = capabilityFeature?.querySelector('model-viewer');
if (capabilityFeature && capabilityModel && !motionPreference.matches && window.matchMedia('(pointer: fine)').matches) {
  capabilityFeature.addEventListener('pointermove', (event) => {
    const bounds = capabilityFeature.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    capabilityModel.style.setProperty('--cap-model-x', `${x * 12}px`);
    capabilityModel.style.setProperty('--cap-model-y', `${y * 12}px`);
    if (capabilityModel.loaded) {
      capabilityModel.removeAttribute('auto-rotate');
      capabilityModel.cameraOrbit = `${(x * 18).toFixed(2)}deg ${(75 - y * 12).toFixed(2)}deg auto`;
    }
  }, { passive: true });
  capabilityFeature.addEventListener('pointerleave', () => {
    capabilityModel.style.setProperty('--cap-model-x', '0px');
    capabilityModel.style.setProperty('--cap-model-y', '0px');
    if (capabilityModel.loaded) {
      capabilityModel.cameraOrbit = '0deg 75deg auto';
      if (!modelMotion.matches) capabilityModel.setAttribute('auto-rotate', '');
    }
  }, { passive: true });
}

const animateMetrics = (node) => {
  if (node.dataset.metricAnimated) return;
  node.dataset.metricAnimated = 'true';
  node.classList.add('metric-active');
};
const metricObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateMetrics(entry.target);
      metricObserver.unobserve(entry.target);
    }
  });
}, { threshold: .45 });
document.querySelectorAll('.stats > div, .hero-proof > div').forEach((metric) => metricObserver.observe(metric));

requestAnimationFrame(() => document.body.classList.add('page-ready'));
