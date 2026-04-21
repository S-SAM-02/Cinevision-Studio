/* =============================================
   CINEVISION STUDIO — Main Application JS
   ============================================= */

'use strict';

// ── Security ─────────────────────────────────
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.key === 'F12') { e.preventDefault(); return false; }
  if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) { e.preventDefault(); return false; }
  if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); return false; }
});

// ── IndexedDB ────────────────────────────────
const DB_NAME = 'CinevisionDB';
const DB_VERSION = 1;
const STORE = 'images';
let db;

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE)) {
        const store = d.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('featured', 'featured', { unique: false });
      }
    };
    req.onsuccess = e => { db = e.target.result; resolve(db); };
    req.onerror = e => reject(e);
  });
}

function dbAdd(record) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).add(record);
    req.onsuccess = () => resolve(req.result);
    req.onerror = e => reject(e);
  });
}

function dbGetAll() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = e => reject(e);
  });
}

function dbDelete(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e);
  });
}

function dbUpdate(record) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).put(record);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e);
  });
}

// ── Gallery JSON Loader ───────────────────────
let jsonGallery = {};

async function loadGalleryJSON() {
  try {
    const res = await fetch('./data/gallery.json?t=' + Date.now());
    jsonGallery = await res.json();
  } catch {
    jsonGallery = { featured: [], wedding: [], baby: [], prewedding: [], events: [], cinematic: [], drone: [], commercial: [] };
  }
}

// ── Category Map ─────────────────────────────
const CAT_MAP = {
  'ALL':             'featured',
  'WEDDING':         'wedding',
  'BABY SHOOT':      'baby',
  'PRE-WEDDING':     'prewedding',
  'ONE DAY EVENT':   'events',
  'CINEMATIC VIDEO': 'cinematic',
  'DRONE':           'drone',
  'COMMERCIAL':      'commercial'
};

const CATEGORIES = ['ALL','WEDDING','BABY SHOOT','PRE-WEDDING','ONE DAY EVENT','CINEMATIC VIDEO','DRONE','COMMERCIAL'];

// ── Navbar ───────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // Hamburger
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) cur = s.id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  });
}

// ── Portfolio ────────────────────────────────
let activeTab = 'ALL';
let allImages = [];

async function buildGallery() {
  const dbImages = await dbGetAll();
  // Merge: JSON first, then DB uploads
  const catImages = {};
  for (const cat of Object.keys(CAT_MAP)) {
    const key = CAT_MAP[cat];
    const jsonUrls = (jsonGallery[key] || []).map(url => ({ url, category: cat, title: '', featured: key === 'featured', fromJSON: true }));
    const dbCat = dbImages.filter(img => img.category === cat).map(img => ({ ...img, fromJSON: false }));
    catImages[cat] = [...jsonUrls, ...dbCat];
  }

  // Featured = json featured + db featured
  const featuredJSON = (jsonGallery.featured || []).map(url => ({ url, category: 'ALL', title: '', featured: true, fromJSON: true }));
  const featuredDB = dbImages.filter(img => img.featured).map(img => ({ ...img, fromJSON: false }));
  catImages['ALL'] = [...featuredJSON, ...featuredDB].slice(0, 8);

  allImages = catImages;
  renderGallery();
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  const emptyEl = document.getElementById('galleryEmpty');
  if (!grid) return;

  const images = (allImages[activeTab] || []).slice(0, activeTab === 'ALL' ? 8 : 999);
  grid.innerHTML = '';

  if (images.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  images.forEach(img => {
    const item = document.createElement('div');
    item.className = 'gallery-item' + (activeTab === 'ALL' ? ' all-tab' : '');

    const image = document.createElement('img');
    image.src = img.url;
    image.alt = img.title || img.category;
    image.loading = 'lazy';
    item.appendChild(image);

    if (activeTab === 'ALL') {
      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';
      overlay.innerHTML = `<span class="gallery-overlay-cat">${img.category || 'PORTFOLIO'}</span><span class="gallery-overlay-view">View Project</span>`;
      item.appendChild(overlay);
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const targetCat = img.category !== 'ALL' ? img.category : CATEGORIES[1];
        switchTab(targetCat);
      });
    }

    grid.appendChild(item);
  });
}

function switchTab(cat) {
  activeTab = cat;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === cat);
  });
  renderGallery();
}

function initPortfolio() {
  const tabsEl = document.getElementById('portfolioTabs');
  if (!tabsEl) return;

  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (cat === 'ALL' ? ' active' : '');
    btn.textContent = cat;
    btn.dataset.cat = cat;
    btn.addEventListener('click', () => switchTab(cat));
    tabsEl.appendChild(btn);
  });
}

// ── Testimonials ─────────────────────────────
const TESTIMONIALS = [
  { quote: "CINEVISION captured our wedding so beautifully. Every frame felt like a movie still. Truly magical!", name: "Priya & Rahul", role: "WEDDING — Bengaluru", emoji: "💍" },
  { quote: "Our baby's shoot was handled so professionally. The photos are breathtaking. We'll cherish them forever.", name: "Meera Nair", role: "BABY SHOOT — Bengaluru", emoji: "👶" },
  { quote: "The drone footage of our event was absolutely stunning. Everyone was impressed by the cinematic quality.", name: "Arjun Sharma", role: "ONE DAY EVENT — Bengaluru", emoji: "🎉" },
  { quote: "The pre-wedding shoot exceeded all our expectations. Every photo tells our love story perfectly.", name: "Deepa & Vikram", role: "PRE-WEDDING — Mysuru", emoji: "💑" },
  { quote: "Professional, creative, and passionate. CINEVISION is the best in Bengaluru, hands down!", name: "Kavitha Reddy", role: "COMMERCIAL — Bengaluru", emoji: "⭐" }
];

let testimonialIdx = 0;
let testimonialTimer;

function showTestimonial(idx) {
  testimonialIdx = (idx + TESTIMONIALS.length) % TESTIMONIALS.length;
  const cards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');
  cards.forEach((c,i) => c.classList.toggle('active', i === testimonialIdx));
  dots.forEach((d,i) => d.classList.toggle('active', i === testimonialIdx));
}

function initTestimonials() {
  const container = document.getElementById('testimonialCards');
  const dotsEl = document.getElementById('testimonialDots');
  if (!container) return;

  TESTIMONIALS.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'testimonial-card' + (i === 0 ? ' active' : '');
    card.innerHTML = `
      <p class="testimonial-quote">"${t.quote}"</p>
      <div class="testimonial-avatar">${t.emoji}</div>
      <p class="testimonial-name">${t.name}</p>
      <p class="testimonial-role">${t.role}</p>
    `;
    container.appendChild(card);

    if (dotsEl) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => { showTestimonial(i); resetTimer(); });
      dotsEl.appendChild(dot);
    }
  });

  document.getElementById('tPrev')?.addEventListener('click', () => { showTestimonial(testimonialIdx - 1); resetTimer(); });
  document.getElementById('tNext')?.addEventListener('click', () => { showTestimonial(testimonialIdx + 1); resetTimer(); });

  startTimer();
}

function startTimer() { testimonialTimer = setInterval(() => showTestimonial(testimonialIdx + 1), 5000); }
function resetTimer() { clearInterval(testimonialTimer); startTimer(); }

// ── Contact Form ─────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      form.style.display = 'none';
      if (success) success.classList.add('show');
    }, 1200);
  });
}

// ── Reveal on Scroll ─────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// ── Welcome Particles ─────────────────────────
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      animation-duration: ${Math.random() * 10 + 8}s;
      animation-delay: ${Math.random() * 8}s;
      background: rgba(200,16,46,${Math.random() * 0.6 + 0.2});
    `;
    container.appendChild(p);
  }
}

// ── Admin Panel ───────────────────────────────
const ADMIN_USER = 'CV2023';
const ADMIN_PASS = 'Cin2023V';

let uploadedFiles = [];
let adminCategory = 'WEDDING';

const CAT_ADMIN_LIST = ['WEDDING','BABY SHOOT','PRE-WEDDING','ONE DAY EVENT','CINEMATIC VIDEO','DRONE','COMMERCIAL'];

function initAdmin() {
  const loginSection = document.getElementById('adminLogin');
  const adminSection = document.getElementById('adminDashboard');
  if (!loginSection) return;

  // Check session
  if (sessionStorage.getItem('cv_admin') === '1') {
    loginSection.style.display = 'none';
    adminSection.classList.add('show');
    loadAdminGallery();
  }

  // Login form
  document.getElementById('loginForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('adminUser').value;
    const p = document.getElementById('adminPass').value;
    const err = document.getElementById('loginError');
    if (u === ADMIN_USER && p === ADMIN_PASS) {
      sessionStorage.setItem('cv_admin', '1');
      loginSection.style.display = 'none';
      adminSection.classList.add('show');
      loadAdminGallery();
    } else {
      err.textContent = 'Invalid credentials. Please try again.';
      err.classList.add('show');
    }
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    sessionStorage.removeItem('cv_admin');
    location.reload();
  });

  // Category select
  const catSelect = document.getElementById('uploadCategory');
  if (catSelect) {
    CAT_ADMIN_LIST.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      catSelect.appendChild(opt);
    });
    catSelect.addEventListener('change', e => { adminCategory = e.target.value; });
  }

  // Drop zone
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
  fileInput?.addEventListener('change', e => handleFiles(e.target.files));

  // Upload btn
  document.getElementById('uploadBtn')?.addEventListener('click', uploadImages);

  // Admin gallery filter
  const filterSelect = document.getElementById('galleryFilter');
  filterSelect?.addEventListener('change', loadAdminGallery);

  // Populate filter
  if (filterSelect) {
    filterSelect.innerHTML = '<option value="ALL">ALL CATEGORIES</option>';
    CAT_ADMIN_LIST.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      filterSelect.appendChild(opt);
    });
  }
}

function handleFiles(files) {
  const preview = document.getElementById('uploadPreview');
  if (!preview) return;

  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    uploadedFiles.push(file);
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'preview-thumb';
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

async function uploadImages() {
  if (uploadedFiles.length === 0) return alert('Please select images first.');
  const progress = document.getElementById('uploadProgress');
  const fill = document.getElementById('progressFill');
  const pct = document.getElementById('progressPct');
  const titleInput = document.getElementById('uploadTitle');

  progress.classList.add('show');

  for (let i = 0; i < uploadedFiles.length; i++) {
    const file = uploadedFiles[i];
    const pctVal = Math.round(((i + 1) / uploadedFiles.length) * 100);
    fill.style.width = pctVal + '%';
    if (pct) pct.textContent = pctVal + '%';

    const dataUrl = await fileToDataURL(file);
    await dbAdd({
      url: dataUrl,
      category: adminCategory,
      title: titleInput?.value || file.name.replace(/\.[^.]+$/, ''),
      featured: false,
      uploadedAt: Date.now()
    });

    await new Promise(r => setTimeout(r, 150));
  }

  uploadedFiles = [];
  document.getElementById('uploadPreview').innerHTML = '';
  if (titleInput) titleInput.value = '';

  setTimeout(() => {
    progress.classList.remove('show');
    fill.style.width = '0%';
  }, 800);

  loadAdminGallery();
  updateStats();
  alert(`✅ ${uploadedFiles.length || 'Images'} uploaded to ${adminCategory}!`);
}

function fileToDataURL(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

async function loadAdminGallery() {
  const grid = document.getElementById('adminGalleryGrid');
  if (!grid) return;

  const all = await dbGetAll();
  const filter = document.getElementById('galleryFilter')?.value || 'ALL';
  const filtered = filter === 'ALL' ? all : all.filter(img => img.category === filter);

  grid.innerHTML = '';

  // Also show JSON gallery images count
  updateStats();

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--gray);font-size:0.85rem;padding:1rem;">No uploaded images in this category. Upload above or edit data/gallery.json for default images.</p>';
    return;
  }

  filtered.reverse().forEach(img => {
    const item = document.createElement('div');
    item.className = 'admin-img-item';
    item.innerHTML = `
      <img src="${img.url}" alt="${img.title || img.category}">
      ${img.featured ? '<div class="featured-badge">Featured</div>' : ''}
      <div class="admin-img-overlay">
        <div class="admin-img-actions">
          <button class="img-action-btn btn-star" title="Toggle Featured">★</button>
          <button class="img-action-btn btn-del" title="Delete">✕</button>
        </div>
      </div>
      <div class="admin-img-info">
        <div class="admin-img-cat">${img.category}</div>
        <div class="admin-img-title">${img.title || 'Untitled'}</div>
      </div>
    `;

    item.querySelector('.btn-star').addEventListener('click', async () => {
      img.featured = !img.featured;
      await dbUpdate(img);
      loadAdminGallery();
    });

    item.querySelector('.btn-del').addEventListener('click', async () => {
      if (confirm('Delete this image?')) {
        await dbDelete(img.id);
        loadAdminGallery();
      }
    });

    grid.appendChild(item);
  });
}

async function updateStats() {
  const all = await dbGetAll();
  const totalUploads = all.length;
  const featured = all.filter(i => i.featured).length;
  const jsonTotal = Object.values(jsonGallery).flat().length;

  const el = id => document.getElementById(id);
  if (el('statUploads')) el('statUploads').textContent = totalUploads;
  if (el('statFeatured')) el('statFeatured').textContent = `${featured}/8`;
  if (el('statJSON')) el('statJSON').textContent = jsonTotal;
  if (el('statCats')) el('statCats').textContent = CAT_ADMIN_LIST.length;
}

// ── Main Init ─────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  await loadGalleryJSON();

  initParticles();
  initNavbar();
  initPortfolio();
  await buildGallery();
  initTestimonials();
  initContactForm();
  initReveal();
  initAdmin();
});
