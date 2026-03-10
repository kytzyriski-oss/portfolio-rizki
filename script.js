/* =============================================
   PORTFOLIO RIZKI - script.js
   ARSITEKTUR FIX:
   - index.html SELALU baca data.json dari server (Netlify)
   - TIDAK pernah baca localStorage untuk konten
   - Foto profil = Cloudinary URL yang ada di data.json
   - Admin → export data.json → replace di Netlify → semua visitor dapat update
   ============================================= */

'use strict';

// ── CONFIG (Edit Here) ──────────────────────────
const CONFIG = {
  EMAILJS_SERVICE_ID:  'YOUR_SERVICE_ID',
  EMAILJS_TEMPLATE_ID: 'YOUR_TEMPLATE_ID',
  EMAILJS_PUBLIC_KEY:  'YOUR_PUBLIC_KEY',
  DATA_URL: 'data.json',
  CACHE_BUST: true, // selalu ambil data.json terbaru dari server
  TYPEWRITER_STRINGS: [
    'Vibe Coder 💻',
    'Cyber Security Expert 🔐',
    'AI Prompt Engineer 🤖',
    'Video / Photo Editor 🎬',
    'Photographer 📷',
    'Data Scientist 📊'
  ],
};

// ── GLOBAL ERROR HANDLER ─────────────────────────
window.onerror = (msg, src, line, col, err) => {
  console.error('[Portfolio Error]', { msg, src, line, col });
  return false;
};
window.addEventListener('unhandledrejection', e => console.error('[Unhandled Promise]', e.reason));

// ── UTILITIES ─────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const sanitize = s => String(s||'')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#x27;');

function showToast(msg, type = 'info', duration = 4000) {
  let container = $('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => {
    t.style.cssText = 'opacity:0;transform:translateX(20px);transition:0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

function createRipple(e, el) {
  const rect = el.getBoundingClientRect();
  const r = document.createElement('span');
  r.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  el.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
}

// ── DATA MANAGER ──────────────────────────────────
// PENTING: Selalu fetch data.json dari server Netlify.
// JANGAN pakai localStorage — visitor lain tidak akan dapat update.
class DataManager {
  async load() {
    const url = CONFIG.CACHE_BUST
      ? CONFIG.DATA_URL + '?t=' + Date.now()
      : CONFIG.DATA_URL;

    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      console.log('[DataManager] ✅ Data loaded from server');
      return data;
    } catch (err) {
      console.warn('[DataManager] ⚠️ Gagal fetch server, pakai fallback:', err.message);
      return this.getFallback();
    }
  }

  getFallback() {
    return {
      profile: {
        name: 'Muhammad Rizki Kurniawan',
        tagline: 'Vibe Coder | Cyber Security | AI Prompt Engineer',
        bio: 'Passionate multi-disciplinary creator bridging technology, creativity, and security.',
        avatar: 'assets/images/profile.jpg',
        location: 'Indonesia',
        email: 'rizki@example.com',
        socials: { github: '#', linkedin: '#', instagram: '#' }
      },
      skills: [], projects: [], certificates: [], experiences: []
    };
  }
}

// ── PARTICLES ─────────────────────────────────────
class ParticleEngine {
  constructor() {
    this.canvas = $('#particles-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -9999, y: -9999 };
    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
    this.animate();
  }
  resize() { this.canvas.width = this.W = window.innerWidth; this.canvas.height = this.H = window.innerHeight; }
  init() { this.particles = Array.from({ length: 60 }, () => this.mkP()); }
  mkP() {
    return { x: Math.random()*this.W, y: Math.random()*this.H,
      vx: (Math.random()-.5)*.4, vy: (Math.random()-.5)*.4,
      size: Math.random()*2+.5, opacity: Math.random()*.5+.1,
      color: Math.random()>.5 ? '0,212,255' : '168,85,247' };
  }
  animate() {
    this.ctx.clearRect(0,0,this.W,this.H);
    this.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x<0||p.x>this.W) p.vx*=-1;
      if (p.y<0||p.y>this.H) p.vy*=-1;
      const dx=p.x-this.mouse.x, dy=p.y-this.mouse.y, d=Math.hypot(dx,dy);
      if (d<120) { p.x+=dx/d*1.5; p.y+=dy/d*1.5; }
      this.ctx.beginPath(); this.ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      this.ctx.fillStyle=`rgba(${p.color},${p.opacity})`; this.ctx.fill();
    });
    for (let i=0;i<this.particles.length;i++)
      for (let j=i+1;j<this.particles.length;j++) {
        const a=this.particles[i],b=this.particles[j],d=Math.hypot(a.x-b.x,a.y-b.y);
        if (d<130) { this.ctx.beginPath(); this.ctx.moveTo(a.x,a.y); this.ctx.lineTo(b.x,b.y);
          this.ctx.strokeStyle=`rgba(0,212,255,${.08*(1-d/130)})`; this.ctx.lineWidth=.5; this.ctx.stroke(); }
      }
    requestAnimationFrame(()=>this.animate());
  }
}

// ── CURSOR GLOW ───────────────────────────────────
class CursorGlow {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'cursor-glow';
    document.body.appendChild(this.el);
    document.addEventListener('mousemove', e => {
      this.el.style.left = e.clientX+'px';
      this.el.style.top  = e.clientY+'px';
    });
  }
}

// ── TYPEWRITER ────────────────────────────────────
class TypeWriter {
  constructor(el, strings) {
    this.el=el; this.strings=strings; this.si=0; this.ci=0; this.deleting=false;
    this.run();
  }
  run() {
    const str=this.strings[this.si];
    const display=this.deleting?str.substring(0,this.ci--):str.substring(0,this.ci++);
    this.el.innerHTML=sanitize(display)+'<span class="cursor"></span>';
    if (!this.deleting&&this.ci>str.length){setTimeout(()=>{this.deleting=true;this.run();},2000);return;}
    if (this.deleting&&this.ci<0){this.deleting=false;this.si=(this.si+1)%this.strings.length;setTimeout(()=>this.run(),400);return;}
    setTimeout(()=>this.run(),this.deleting?40:80);
  }
}

// ── THEME ─────────────────────────────────────────
class ThemeManager {
  constructor() {
    this.key='portfolioTheme';
    this.current=localStorage.getItem(this.key)||'dark';
    this.apply(this.current);
    $$('.theme-toggle').forEach(btn=>btn.addEventListener('click',()=>this.toggle()));
  }
  toggle(){this.current=this.current==='dark'?'light':'dark';this.apply(this.current);localStorage.setItem(this.key,this.current);}
  apply(t){
    document.documentElement.setAttribute('data-theme',t);
    $$('.theme-toggle').forEach(btn=>{btn.textContent=t==='dark'?'☀️':'🌙';});
  }
}

// ── SCROLL ANIMATOR ───────────────────────────────
class ScrollAnimator {
  constructor() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        const bar = e.target.querySelector?.('.skill-fill');
        if (bar) setTimeout(()=>bar.style.width=bar.dataset.level+'%', 200);
        this.observer.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  }
  observe(el) { this.observer.observe(el); }
}

// ── RENDERER ──────────────────────────────────────
class Renderer {
  constructor(data, sa) { this.data=data; this.sa=sa; }

  renderAll() {
    this.renderProfile();
    this.renderSkills();
    this.renderProjects();
    this.renderCertificates();
    this.renderExperiences();
  }

  renderProfile() {
    const p = this.data.profile;
    if (!p) return;

    // Hero name
    const heroName = $('#hero-name');
    if (heroName) {
      const parts = p.name.trim().split(' ');
      const mid = Math.ceil(parts.length / 2);
      heroName.innerHTML = sanitize(parts.slice(0,mid).join(' ')) + '<br><span>' + sanitize(parts.slice(mid).join(' ')) + '</span>';
    }

    // Bio, location, email
    const bioEl=$('#about-bio'); if(bioEl) bioEl.textContent=p.bio||'';
    const locEl=$('#about-location'); if(locEl) locEl.textContent=p.location||'';
    const emailEl=$('#about-email'); if(emailEl) emailEl.textContent=p.email||'';

    // ── AVATAR: baca dari data.json (Cloudinary URL atau path lokal) ──
    this.renderAvatar(p.avatar);

    // Social links
    const ghLink=$('#github-link'); if(ghLink&&p.socials?.github) ghLink.href=p.socials.github;
    const liLink=$('#linkedin-link'); if(liLink&&p.socials?.linkedin) liLink.href=p.socials.linkedin;
    const igLink=$('#instagram-link'); if(igLink&&p.socials?.instagram) igLink.href=p.socials.instagram;

    const contactEmail=$('#contact-email');
    if(contactEmail&&p.email){contactEmail.href='mailto:'+p.email;contactEmail.textContent=p.email;}

    $$('.footer-social[data-link]').forEach(el=>{
      const key=el.dataset.link;
      if(p.socials?.[key]) el.href=p.socials[key];
    });
  }

  renderAvatar(src) {
    const avatarEl = $('#about-avatar');
    const placeholder = $('#about-avatar-placeholder');

    if (!avatarEl) return;

    const cleanSrc = (src || '').trim();

    if (!cleanSrc) {
      // Tidak ada foto → tampilkan placeholder
      avatarEl.style.display = 'none';
      if (placeholder) { placeholder.style.display = 'flex'; }
      return;
    }

    // Ada foto src → load gambar
    avatarEl.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';

    // Pasang src baru hanya jika berbeda (hindari re-flash)
    if (avatarEl.getAttribute('src') !== cleanSrc) {
      avatarEl.src = cleanSrc;
    }

    avatarEl.onload = () => {
      avatarEl.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    };

    avatarEl.onerror = () => {
      console.warn('[Avatar] Gagal load foto:', cleanSrc);
      avatarEl.style.display = 'none';
      if (placeholder) { placeholder.style.display = 'flex'; }
    };
  }

  renderSkills() {
    const grid=$('#skills-grid');
    if(!grid||!this.data.skills?.length) return;
    grid.innerHTML=this.data.skills.map((s,i)=>`
      <div class="skill-card reveal" style="transition-delay:${i*.06}s">
        <div class="skill-header">
          <span class="skill-icon">${sanitize(s.icon)}</span>
          <span class="skill-name">${sanitize(s.name)}</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" data-level="${s.level}" style="background:${sanitize(s.color)}"></div></div>
        <div class="skill-level">${s.level}%</div>
      </div>`).join('');
    $$('.skill-card',grid).forEach(el=>this.sa.observe(el));
  }

  renderProjects(filter='All', query='') {
    const grid=$('#portfolio-grid');
    if(!grid) return;
    const sorted=[...(this.data.projects||[])].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    const filtered=sorted.filter(p=>{
      const matchCat=filter==='All'||p.category===filter;
      const q=query.toLowerCase();
      const matchQ=!q||p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q)||(p.tech||[]).join(' ').toLowerCase().includes(q);
      return matchCat&&matchQ;
    });
    if(!filtered.length){
      grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text3)">Tidak ada project ditemukan 🔍</div>`;
      return;
    }
    const catEmoji={'Vibe Coding':'💻','Cyber Security':'🔐','AI Prompt Engineer':'🤖','Editing Video/Foto':'🎬','Fotografi':'📷','Data Entry/Data Science':'📊'};
    grid.innerHTML=filtered.map((p,i)=>{
      const imgSrc=(p.image||'').trim();
      const imgTag=imgSrc
        ? `<img class="project-img" src="${sanitize(imgSrc)}" alt="${sanitize(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : '';
      const phStyle=imgSrc?'display:none':'';
      return `
        <div class="project-card reveal ${p.featured?'featured':''}" style="transition-delay:${i*.07}s">
          ${p.featured?'<span class="featured-badge">⭐ Featured</span>':''}
          <div style="overflow:hidden">
            ${imgTag}
            <div class="project-img-placeholder" style="${phStyle}">${catEmoji[p.category]||'🚀'}</div>
          </div>
          <div class="project-body">
            <div class="project-cat">${catEmoji[p.category]||''} ${sanitize(p.category)}</div>
            <div class="project-name">${sanitize(p.name)}</div>
            <div class="project-desc">${sanitize(p.desc)}</div>
            <div class="project-expand">
              <div class="project-tech">${(p.tech||[]).map(t=>`<span class="tech-tag">${sanitize(t)}</span>`).join('')}</div>
              <div class="project-actions">
                ${p.url&&p.url!=='#'?`<a href="${sanitize(p.url)}" target="_blank" rel="noopener" class="btn-small btn-live">🌐 Live Demo</a>`:`<span class="btn-small btn-live" style="opacity:0.5">🌐 Coming Soon</span>`}
                ${p.github&&p.github!=='#'?`<a href="${sanitize(p.github)}" target="_blank" rel="noopener" class="btn-small btn-code">📂 Code</a>`:''}
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    $$('.project-card',grid).forEach((card)=>{
      this.sa.observe(card);
      card.addEventListener('mouseenter',()=>card.classList.add('expanded'));
      card.addEventListener('mouseleave',()=>card.classList.remove('expanded'));
      $$('.btn-small',card).forEach(btn=>btn.addEventListener('click',e=>createRipple(e,btn)));
      if(window.anime){
        card.addEventListener('mouseenter',()=>anime({targets:card,boxShadow:'0 8px 40px rgba(0,212,255,0.2)',duration:400,easing:'easeOutCubic'}));
        card.addEventListener('mouseleave',()=>anime({targets:card,boxShadow:'0 0 0px rgba(0,212,255,0)',duration:400,easing:'easeOutCubic'}));
      }
    });
  }

  renderCertificates() {
    const grid=$('#certs-grid');
    if(!grid||!this.data.certificates?.length) return;
    grid.innerHTML=this.data.certificates.map((c,i)=>`
      <div class="cert-card reveal" style="transition-delay:${i*.1}s">
        <div class="cert-badge-big">${sanitize(c.badge)}</div>
        <div>
          <div class="cert-issuer">${sanitize(c.issuer)}</div>
          <div class="cert-name">${sanitize(c.name)}</div>
          <div class="cert-date">📅 ${sanitize(c.date)}</div>
          ${c.url&&c.url!=='#'?`<a href="${sanitize(c.url)}" target="_blank" class="cert-link">Lihat Sertifikat →</a>`:''}
        </div>
      </div>`).join('');
    $$('.cert-card',grid).forEach(el=>this.sa.observe(el));
  }

  renderExperiences() {
    const tl=$('#experience-timeline');
    if(!tl||!this.data.experiences?.length) return;
    tl.innerHTML=this.data.experiences.map((e,i)=>`
      <div class="timeline-item" style="transition-delay:${i*.15}s">
        <div class="timeline-dot"></div>
        <div class="exp-type">${sanitize(e.type)}</div>
        <div class="exp-period">📅 ${sanitize(e.period)}</div>
        <div class="exp-role">${sanitize(e.role)}</div>
        <div class="exp-company">🏢 ${sanitize(e.company)}</div>
        <div class="exp-desc">${sanitize(e.desc)}</div>
        <div class="exp-skills">${(e.skills||[]).map(s=>`<span class="exp-skill-tag">${sanitize(s)}</span>`).join('')}</div>
      </div>`).join('');
    $$('.timeline-item',tl).forEach(el=>this.sa.observe(el));
  }
}

// ── GSAP ANIMATIONS ───────────────────────────────
function initGSAP() {
  if(!window.gsap||!window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const tl=gsap.timeline({delay:0.3});
  tl.to('.hero-badge',{opacity:1,y:0,duration:0.6,ease:'power3.out'})
    .to('#hero-name',{opacity:1,y:0,duration:0.7,ease:'power3.out'},'-=0.3')
    .to('.hero-typewriter',{opacity:1,duration:0.5},'-=0.2')
    .to('.hero-desc',{opacity:1,y:0,duration:0.5,ease:'power2.out'},'-=0.2')
    .to('.hero-cta',{opacity:1,y:0,duration:0.5,ease:'power2.out'},'-=0.2')
    .to('.hero-scroll',{opacity:1,duration:0.5},'-=0.1');

  $$('.section-label,.section-title,.section-subtitle').forEach(el=>{
    gsap.to(el,{scrollTrigger:{trigger:el,start:'top 88%'},opacity:1,y:0,duration:0.7,ease:'power3.out'});
  });
  gsap.to('.portfolio-filters',{scrollTrigger:{trigger:'.portfolio-filters',start:'top 88%'},opacity:1,y:0,duration:0.5});
  gsap.to('.portfolio-search',{scrollTrigger:{trigger:'.portfolio-search',start:'top 88%'},opacity:1,duration:0.5,delay:0.2});
  gsap.to('#particles-canvas',{scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:1},y:100});
}

// ── ANIME.JS ──────────────────────────────────────
function initAnime() {
  if(!window.anime) return;
  const brand=$('.nav-brand');
  if(brand){
    brand.addEventListener('mouseenter',()=>anime({targets:brand,scale:1.05,duration:300,easing:'easeOutBack'}));
    brand.addEventListener('mouseleave',()=>anime({targets:brand,scale:1,duration:300,easing:'easeOutBack'}));
  }
  $$('.filter-btn,.btn-primary,.btn-submit').forEach(btn=>{
    btn.addEventListener('click',e=>{createRipple(e,btn);anime({targets:btn,scale:[0.95,1],duration:200,easing:'easeOutBack'});});
  });
}

// ── PORTFOLIO FILTER ──────────────────────────────
function initPortfolioFilter(renderer, data) {
  const filtersEl=$('#portfolio-filters');
  if(!filtersEl) return;
  const categories=['All',...new Set((data.projects||[]).map(p=>p.category))];
  filtersEl.innerHTML=categories.map(c=>`<button class="filter-btn ${c==='All'?'active':''}" data-cat="${sanitize(c)}">${sanitize(c)}</button>`).join('');
  let currentFilter='All', searchQuery='';
  filtersEl.addEventListener('click',e=>{
    const btn=e.target.closest('.filter-btn');
    if(!btn) return;
    $$('.filter-btn',filtersEl).forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter=btn.dataset.cat;
    renderer.renderProjects(currentFilter,searchQuery);
    initAnime();
  });
  const searchInput=$('#portfolio-search-input');
  if(searchInput) searchInput.addEventListener('input',e=>{searchQuery=e.target.value.toLowerCase().trim();renderer.renderProjects(currentFilter,searchQuery);});
}

// ── NAVBAR ────────────────────────────────────────
function initNavbar() {
  const nav=$('nav');
  window.addEventListener('scroll',()=>nav?.classList.toggle('scrolled',window.scrollY>20));
  $$('.nav-links a,.hero-cta a[href^="#"],.nav-mobile-menu a').forEach(a=>{
    a.addEventListener('click',e=>{
      const href=a.getAttribute('href');
      if(href?.startsWith('#')){
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({behavior:'smooth'});
        $('.nav-mobile-menu')?.classList.remove('open');
      }
    });
  });
  const hamburger=$('.nav-hamburger'), mobileMenu=$('.nav-mobile-menu');
  if(hamburger&&mobileMenu) hamburger.addEventListener('click',()=>mobileMenu.classList.toggle('open'));
}

// ── CONTACT FORM ──────────────────────────────────
function initContactForm() {
  const form=$('#contact-form');
  if(!form) return;
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!validateForm(form)) return;
    const btn=form.querySelector('.btn-submit');
    btn.classList.add('loading'); btn.textContent='Mengirim... ⏳';
    const formData={
      name: sanitize(form.querySelector('#name')?.value||''),
      email: sanitize(form.querySelector('#email')?.value||''),
      subject: sanitize(form.querySelector('#subject')?.value||''),
      message: sanitize(form.querySelector('#message')?.value||''),
    };
    try {
      if(window.emailjs&&CONFIG.EMAILJS_SERVICE_ID!=='YOUR_SERVICE_ID'){
        await emailjs.send(CONFIG.EMAILJS_SERVICE_ID,CONFIG.EMAILJS_TEMPLATE_ID,formData);
        showToast('Pesan terkirim! 🎉','success');
      } else {
        await new Promise(r=>setTimeout(r,1500));
        showToast('Pesan terkirim! (Demo mode — konfigurasi EmailJS di script.js) 📧','info');
      }
      form.reset();
      const s=$('.form-success'); if(s){s.classList.add('show');setTimeout(()=>s.classList.remove('show'),4000);}
    } catch(err) {
      showToast('Gagal kirim pesan. Coba lagi. ❌','error');
    } finally {
      btn.classList.remove('loading'); btn.textContent='Kirim Pesan 🚀';
    }
  });
}

function validateForm(form) {
  let valid=true;
  $$('[required]',form).forEach(field=>{
    const err=field.parentElement.querySelector('.form-error');
    if(!field.value.trim()){field.classList.add('error');if(err)err.textContent='Field ini wajib diisi';valid=false;}
    else if(field.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)){field.classList.add('error');if(err)err.textContent='Email tidak valid';valid=false;}
    else{field.classList.remove('error');if(err)err.textContent='';}
  });
  return valid;
}

// ── LOADING SCREEN ────────────────────────────────
function hideLoading() {
  const screen=$('#loading-screen');
  if(screen) setTimeout(()=>screen.classList.add('hidden'),1600);
}

// ── MAIN ──────────────────────────────────────────
async function main() {
  try {
    // Loading text steps
    const loadingText=$('.loader-text');
    const steps=['Memuat data...','Inisialisasi animasi...','Render konten...','Selesai!'];
    let step=0;
    const interval=setInterval(()=>{if(loadingText&&step<steps.length)loadingText.textContent=steps[step++];else clearInterval(interval);},380);

    // 1. Load data dari server (BUKAN localStorage)
    const dm=new DataManager();
    const data=await dm.load();

    // 2. Init systems
    new ParticleEngine();
    new CursorGlow();
    new ThemeManager();

    // 3. Render konten
    const sa=new ScrollAnimator();
    const renderer=new Renderer(data,sa);
    renderer.renderAll();

    // 4. Observe reveal elements
    $$('.reveal').forEach(el=>sa.observe(el));

    // 5. Typewriter
    const twEl=$('#hero-typewriter-text');
    if(twEl) new TypeWriter(twEl,CONFIG.TYPEWRITER_STRINGS);

    // 6. Init interactive features
    initNavbar();
    initPortfolioFilter(renderer,data);
    initGSAP();
    initAnime();
    initContactForm();

    // 7. Observe reveal elements yang baru dirender
    setTimeout(()=>$$('.reveal:not(.visible)').forEach(el=>sa.observe(el)),300);

    hideLoading();

  } catch(err) {
    console.error('[Main]',err);
    hideLoading();
    showToast('Ada yang gagal dimuat. Coba refresh halaman. 🔄','error');
  }
}

document.addEventListener('DOMContentLoaded', main);
