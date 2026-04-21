/* =============================================
   CINEVISION — 3D Animated Background Engine
   Starfield + Neon Grid + Floating Particles
   ============================================= */

(function () {
  'use strict';

  const canvas = document.getElementById('bg3d');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, cx, cy;
  let animFrame;
  let tick = 0;

  /* ── resize ─────────────────────────────── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
    buildGrid();
  }

  /* ── STARFIELD ───────────────────────────── */
  const STAR_COUNT = 200;
  const STAR_SPEED  = 3;
  const stars = [];

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) stars.push(newStar(true));
  }

  function newStar(randomZ) {
    return {
      x: (Math.random() - 0.5) * W * 2,
      y: (Math.random() - 0.5) * H * 2,
      z: randomZ ? Math.random() * W : W,
      pz: 0,
    };
  }

  function drawStars() {
    ctx.save();
    ctx.translate(cx, cy);
    for (const s of stars) {
      s.pz = s.z;
      s.z -= STAR_SPEED;
      if (s.z <= 0) { Object.assign(s, newStar(false)); continue; }

      const sx  = (s.x / s.z) * W * 0.5;
      const sy  = (s.y / s.z) * H * 0.5;
      const psx = (s.x / s.pz) * W * 0.5;
      const psy = (s.y / s.pz) * H * 0.5;

      const size    = Math.max(0, (1 - s.z / W) * 2.2);
      const alpha   = Math.min(1, (1 - s.z / W) * 1.4);
      const neonIdx = Math.abs(Math.floor(s.x * 7 + s.y * 3)) % 3;
      const colors  = ['rgba(0,245,255,', 'rgba(200,16,46,', 'rgba(180,100,255,'];
      const col     = colors[neonIdx] + alpha.toFixed(2) + ')';

      ctx.beginPath();
      ctx.moveTo(psx, psy);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = col;
      ctx.lineWidth   = size;
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ── NEON GRID (perspective) ─────────────── */
  const GRID_LINES  = 12;
  const GRID_SIZE   = 1800;
  const HORIZON_Y   = 0.62;   // fraction of H
  let gridPts = [];

  function buildGrid() {
    gridPts = [];
    const step = GRID_SIZE / GRID_LINES;
    const hy   = H * HORIZON_Y;
    const fov  = 500;

    for (let r = 0; r <= GRID_LINES; r++) {
      const row = [];
      for (let c = 0; c <= GRID_LINES; c++) {
        const worldX = (c - GRID_LINES / 2) * step;
        const worldZ = r * step * 0.8 + 60;
        const scale  = fov / (fov + worldZ);
        row.push({
          sx: cx + worldX * scale,
          sy: hy  + (H - hy) * (1 - fov / (fov + worldZ)) * 2.5,
          scale,
        });
      }
      gridPts.push(row);
    }
  }

  function drawGrid() {
    const t       = tick * 0.004;
    const baseAlpha = 0.18;

    ctx.save();
    for (let r = 0; r < gridPts.length - 1; r++) {
      for (let c = 0; c < gridPts[r].length - 1; c++) {
        const a = gridPts[r][c];
        const b = gridPts[r][c + 1];
        const d = gridPts[r + 1][c];

        const pulse = baseAlpha + 0.07 * Math.sin(t + r * 0.4 + c * 0.3);

        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = `rgba(0,245,255,${pulse.toFixed(3)})`;
        ctx.lineWidth   = 0.7;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(d.sx, d.sy);
        ctx.strokeStyle = `rgba(180,100,255,${(pulse * 0.7).toFixed(3)})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /* ── FLOATING NEON PARTICLES ─────────────── */
  const PARTICLES   = 60;
  const particles   = [];

  class NeonParticle {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H * 0.85;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = -(Math.random() * 0.6 + 0.1);
      this.r  = Math.random() * 2.5 + 0.5;
      this.life = 0;
      this.maxLife = 200 + Math.random() * 300;
      const palette = ['#00f5ff', '#c8102e', '#b464ff', '#ff006e', '#ffffff'];
      this.color = palette[Math.floor(Math.random() * palette.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -20) this.init();
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.85;
      const grd   = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 5);
      const hex2  = this.color + '88';
      grd.addColorStop(0, this.color);
      grd.addColorStop(0.4, hex2);
      grd.addColorStop(1, 'transparent');

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLES; i++) {
      const p = new NeonParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }
  }

  /* ── NEON CONNECTION LINES ───────────────── */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a  = particles[i];
        const b  = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          const alpha = (1 - d / 100) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,245,255,${alpha.toFixed(3)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ── AMBIENT ORBS ────────────────────────── */
  function drawOrbs() {
    const t = tick * 0.003;
    const orbs = [
      { x: W * 0.15, y: H * 0.35, r: 200, color: 'rgba(200,16,46,', a: 0.04 },
      { x: W * 0.85, y: H * 0.25, r: 250, color: 'rgba(0,245,255,', a: 0.035 },
      { x: W * 0.5,  y: H * 0.6,  r: 300, color: 'rgba(180,100,255,', a: 0.03 },
    ];
    orbs.forEach((o, i) => {
      const dy = Math.sin(t + i * 1.4) * 30;
      const grd = ctx.createRadialGradient(o.x, o.y + dy, 0, o.x, o.y + dy, o.r);
      const pulse = o.a + 0.015 * Math.sin(t * 1.2 + i);
      grd.addColorStop(0, o.color + pulse.toFixed(4) + ')');
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(o.x, o.y + dy, o.r, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    });
  }

  /* ── MAIN LOOP ───────────────────────────── */
  function loop() {
    ctx.clearRect(0, 0, W, H);
    tick++;
    drawOrbs();
    drawGrid();
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    drawStars();
    animFrame = requestAnimationFrame(loop);
  }

  /* ── INIT ────────────────────────────────── */
  resize();
  initStars();
  initParticles();
  loop();

  window.addEventListener('resize', () => {
    resize();
    initStars();
  });
})();
