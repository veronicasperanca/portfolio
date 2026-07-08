/* ============================================================
   VERÔNICA SPERANÇA — Portfolio JavaScript
   Micro-interactions, Particle Network, Animations
   ============================================================ */

'use strict';

/* ============= CUSTOM CURSOR ============= */
class CustomCursor {
  constructor() {
    this.dot  = document.querySelector('.cursor');
    this.ring = document.querySelector('.cursor-ring');
    if (!this.dot || !this.ring) return;

    this.dotX = 0; this.dotY = 0;
    this.ringX = 0; this.ringY = 0;
    this.speed = 0.15;
    this.isHovering = false;

    this.bind();
    this.render();
  }

  bind() {
    document.addEventListener('mousemove', e => {
      this.dotX = e.clientX;
      this.dotY = e.clientY;
    });

    document.querySelectorAll('a, button, .btn, .case-card, .expertise-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.dot.classList.add('is-hovering');
        this.ring.classList.add('is-hovering');
      });
      el.addEventListener('mouseleave', () => {
        this.dot.classList.remove('is-hovering');
        this.ring.classList.remove('is-hovering');
      });
    });

    document.addEventListener('mousedown', () => this.dot.classList.add('is-clicking'));
    document.addEventListener('mouseup',   () => this.dot.classList.remove('is-clicking'));
    document.addEventListener('mouseleave', () => {
      this.dot.style.opacity  = '0';
      this.ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      this.dot.style.opacity  = '1';
      this.ring.style.opacity = '1';
    });
  }

  render() {
    this.ringX += (this.dotX - this.ringX) * this.speed;
    this.ringY += (this.dotY - this.ringY) * this.speed;

    this.dot.style.left  = this.dotX + 'px';
    this.dot.style.top   = this.dotY + 'px';
    this.ring.style.left = this.ringX + 'px';
    this.ring.style.top  = this.ringY + 'px';

    requestAnimationFrame(() => this.render());
  }
}

/* ============= PARTICLE NETWORK ============= */
class ParticleNetwork {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };
    this.maxDist = 130;
    this.mouseRadius = 100;

    this.resize();
    this.populate();
    this.animate();
    window.addEventListener('resize', () => { this.resize(); this.populate(); });

    this.canvas.addEventListener('mousemove', e => {
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });
  }

  resize() {
    this.canvas.width  = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  populate() {
    this.particles = [];
    const count = Math.floor((this.canvas.width * this.canvas.height) / 14000);
    for (let i = 0; i < Math.min(count, 80); i++) {
      this.particles.push({
        x:   Math.random() * this.canvas.width,
        y:   Math.random() * this.canvas.height,
        vx:  (Math.random() - 0.5) * 0.25,
        vy:  (Math.random() - 0.5) * 0.25,
        r:   Math.random() * 1.5 + 0.5,
        op:  Math.random() * 0.4 + 0.15
      });
    }
  }

  update() {
    this.particles.forEach(p => {
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.mouseRadius) {
        const force = (this.mouseRadius - dist) / this.mouseRadius;
        p.x -= dx * force * 0.02;
        p.y -= dy * force * 0.02;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxDist) {
          const alpha = (1 - dist / this.maxDist) * 0.12;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(201,169,110,${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }

    // Draw particles
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(201,169,110,${p.op})`;
      this.ctx.fill();
    });
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

/* ============= TYPING EFFECT ============= */
class TypeWriter {
  constructor(elementId, phrases, speed = 60) {
    this.el = document.getElementById(elementId);
    if (!this.el) return;
    this.phrases = phrases;
    this.speed   = speed;
    this.del     = 40;
    this.wait    = 2200;
    this.txt     = '';
    this.phraseI = 0;
    this.charI   = 0;
    this.deleting = false;

    this.cursor = document.createElement('span');
    this.cursor.className = 'typed-cursor';
    this.el.parentNode.appendChild(this.cursor);

    this.tick();
  }

  tick() {
    const current = this.phrases[this.phraseI % this.phrases.length];

    if (this.deleting) {
      this.txt = current.substring(0, this.charI - 1);
      this.charI--;
    } else {
      this.txt = current.substring(0, this.charI + 1);
      this.charI++;
    }

    this.el.textContent = this.txt;

    let timeout = this.deleting ? this.del : this.speed;

    if (!this.deleting && this.charI === current.length) {
      timeout = this.wait;
      this.deleting = true;
    } else if (this.deleting && this.charI === 0) {
      this.deleting = false;
      this.phraseI++;
      timeout = 400;
    }

    setTimeout(() => this.tick(), timeout);
  }
}

/* ============= COUNTER ANIMATION ============= */
class CounterAnimation {
  constructor() {
    this.counters = document.querySelectorAll('.counter');
    if (!this.counters.length) return;

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.done) {
          this.animateCounter(entry.target);
          entry.target.dataset.done = 'true';
        }
      });
    }, { threshold: 0.5 });

    this.counters.forEach(c => this.observer.observe(c));
  }

  animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };

    requestAnimationFrame(step);
  }
}

/* ============= SCROLL PROGRESS BAR ============= */
class ScrollProgress {
  constructor() {
    this.bar = document.getElementById('scrollProgress');
    if (!this.bar) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
  }

  update() {
    const scroll = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const pct    = height > 0 ? (scroll / height) * 100 : 0;
    this.bar.style.width = pct + '%';
  }
}

/* ============= NAVIGATION SCROLL BEHAVIOR ============= */
class NavBehavior {
  constructor() {
    this.nav  = document.getElementById('nav');
    this.btn  = document.getElementById('menuBtn');
    this.menu = document.getElementById('mobileMenu');
    if (!this.nav) return;

    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    if (this.btn && this.menu) {
      this.btn.addEventListener('click', () => this.toggleMenu());
      this.menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => this.closeMenu());
      });
    }

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          this.closeMenu();
        }
      });
    });
  }

  onScroll() {
    if (window.scrollY > 60) {
      this.nav.classList.add('scrolled');
    } else {
      this.nav.classList.remove('scrolled');
    }
  }

  toggleMenu() {
    this.menu.classList.toggle('open');
    const isOpen = this.menu.classList.contains('open');
    this.btn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  closeMenu() {
    this.menu.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ============= SCROLL REVEAL ============= */
class ScrollReveal {
  constructor() {
    this.elements = document.querySelectorAll('.reveal, .case-card');
    if (!this.elements.length) return;

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible', 'revealed');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    this.elements.forEach(el => this.observer.observe(el));
  }
}

/* ============= MAGNETIC BUTTONS ============= */
class MagneticButtons {
  constructor() {
    document.querySelectorAll('.btn--primary').forEach(btn => {
      btn.addEventListener('mousemove', e => this.pull(e, btn));
      btn.addEventListener('mouseleave', () => this.release(btn));
    });
  }

  pull(e, btn) {
    const rect   = btn.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) * 0.28;
    const dy     = (e.clientY - cy) * 0.28;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  release(btn) {
    btn.style.transform = '';
  }
}

/* ============= CASE PAGE: TIMELINE REVEAL ============= */
class TimelineReveal {
  constructor() {
    const steps = document.querySelectorAll('.timeline-step');
    if (!steps.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 120);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    steps.forEach(s => obs.observe(s));
  }
}

/* ============= CASE PAGE: BEFORE/AFTER SLIDER ============= */
class BeforeAfterSlider {
  constructor() {
    document.querySelectorAll('.ba-slider').forEach(slider => {
      const handle  = slider.querySelector('.ba-handle');
      const after   = slider.querySelector('.ba-after');
      if (!handle || !after) return;

      let dragging = false;
      const update = x => {
        const rect = slider.getBoundingClientRect();
        const pct  = Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100));
        after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        handle.style.left    = pct + '%';
      };

      handle.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
      window.addEventListener('mouseup',   () => { dragging = false; });
      window.addEventListener('mousemove', e => { if (dragging) update(e.clientX); });

      // Touch
      handle.addEventListener('touchstart', e => { dragging = true; e.preventDefault(); }, { passive: false });
      window.addEventListener('touchend',   () => { dragging = false; });
      window.addEventListener('touchmove',  e => { if (dragging) update(e.touches[0].clientX); }, { passive: true });
    });
  }
}

/* ============= SKILLS PROGRESS BARS ============= */
class SkillBars {
  constructor() {
    const bars = document.querySelectorAll('.skill-fill');
    if (!bars.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target.dataset.width;
          setTimeout(() => {
            entry.target.style.width = target + '%';
          }, 200);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    bars.forEach(b => obs.observe(b));
  }
}

/* ============= PARALLAX HERO ============= */
class HeroParallax {
  constructor() {
    this.orbs = document.querySelectorAll('.hero__ambient-orb');
    if (!this.orbs.length) return;
    window.addEventListener('mousemove', e => this.move(e), { passive: true });
  }

  move(e) {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    this.orbs.forEach((orb, i) => {
      const factor = (i + 1) * 12;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  }
}

/* ============= TAB SYSTEM (case pages) ============= */
class TabSystem {
  constructor() {
    document.querySelectorAll('.tab-group').forEach(group => {
      const btns    = group.querySelectorAll('.tab-btn');
      const panels  = group.querySelectorAll('.tab-panel');

      btns.forEach((btn, i) => {
        btn.addEventListener('click', () => {
          btns.forEach(b   => b.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          panels[i]?.classList.add('active');
        });
      });
    });
  }
}

/* ============= READING PROGRESS (case pages) ============= */
class ReadingProgress {
  constructor() {
    this.el = document.getElementById('readingProgress');
    if (!this.el) return;
    const article = document.querySelector('.case-article');
    if (!article) return;

    window.addEventListener('scroll', () => {
      const rect = article.getBoundingClientRect();
      const total = article.offsetHeight - window.innerHeight;
      const read  = Math.max(0, -rect.top);
      const pct   = Math.min(100, (read / total) * 100);
      this.el.style.width = pct + '%';
    }, { passive: true });
  }
}

/* ============= STICKY TOC (case pages) ============= */
class StickyTOC {
  constructor() {
    const toc    = document.getElementById('caseTOC');
    const links  = toc ? toc.querySelectorAll('a') : [];
    if (!links.length) return;

    const headings = Array.from(links).map(l => {
      const target = document.querySelector(l.getAttribute('href'));
      return { link: l, target };
    }).filter(i => i.target);

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY + 120;
      let current = headings[0];
      headings.forEach(h => {
        if (h.target.offsetTop <= scrollY) current = h;
      });
      links.forEach(l => l.classList.remove('active'));
      if (current) current.link.classList.add('active');
    }, { passive: true });
  }
}

/* ============= GLOW CURSOR ON DARK BG ============= */
class BackgroundGlow {
  constructor() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const glow = document.createElement('div');
    glow.style.cssText = `
      position:absolute; width:300px; height:300px;
      background:radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%);
      border-radius:50%; pointer-events:none; z-index:3;
      transition: transform 0.3s ease; will-change:transform;
    `;
    hero.appendChild(glow);

    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      glow.style.transform = `translate(${e.clientX - r.left - 150}px, ${e.clientY - r.top - 150}px)`;
    });
  }
}

/* ============= INIT ALL ============= */
document.addEventListener('DOMContentLoaded', () => {
  // Core UI
  new CustomCursor();
  new ScrollProgress();
  new NavBehavior();
  new ScrollReveal();
  new MagneticButtons();
  new HeroParallax();
  new BackgroundGlow();

  // Particle canvas
  new ParticleNetwork('particleCanvas');

  // Counter animation
  new CounterAnimation();

  // Typing effect (hero page)
  const typedEl = document.getElementById('typedText');
  if (typedEl) {
    new TypeWriter('typedText', [
      'I turn data into design decisions.',
      'I connect user psychology to business.',
      'I build systems that retain and convert.',
      'Product-Led Growth with high-caliber design.',
    ], 55);
  }

  // Case page features
  new TimelineReveal();
  new BeforeAfterSlider();
  new SkillBars();
  new TabSystem();
  new ReadingProgress();
  new StickyTOC();
});

/* ============= JOURNEY STEPPER (case pages) ============= */
class JourneyStepper {
  constructor() {
    const sections = document.querySelectorAll('.journey-stepper');
    sections.forEach(section => this.init(section));
  }

  init(section) {
    const panels   = section.querySelectorAll('.screen-panel');
    const dots     = section.querySelectorAll('.journey-step-dot');
    const connectors = section.querySelectorAll('.journey-connector');
    const prevBtn  = section.querySelector('.journey-btn--prev');
    const nextBtn  = section.querySelector('.journey-btn--next');
    const counter  = section.querySelector('.journey-counter');
    let current    = 0;

    const total = panels.length;

    const go = (idx) => {
      panels.forEach(p => { p.classList.remove('active'); });
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === idx);
        d.classList.toggle('completed', i < idx);
      });
      connectors.forEach((c, i) => {
        c.classList.toggle('completed', i < idx);
      });
      panels[idx]?.classList.add('active');
      if (counter) counter.textContent = `${idx + 1} / ${total}`;
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) nextBtn.disabled = idx === total - 1;
      current = idx;

      // Animate progress fills inside active panel
      const fills = panels[idx]?.querySelectorAll('.ui-progress__fill');
      fills?.forEach(fill => {
        const target = fill.dataset.width || '70';
        fill.style.width = '0%';
        requestAnimationFrame(() => {
          setTimeout(() => { fill.style.width = target + '%'; }, 100);
        });
      });
    };

    // Dot clicks
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => go(i));
    });

    // Prev/Next
    if (prevBtn) prevBtn.addEventListener('click', () => { if (current > 0) go(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', () => { if (current < total - 1) go(current + 1); });

    // Init
    go(0);

    // Keyboard navigation when section is focused area
    section.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' && current < total - 1) go(current + 1);
      if (e.key === 'ArrowLeft'  && current > 0)         go(current - 1);
    });
  }
}

// Add to init
document.addEventListener('DOMContentLoaded', () => {
  new JourneyStepper();
});