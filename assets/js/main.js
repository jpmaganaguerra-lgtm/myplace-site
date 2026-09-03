/* ── Hero: marquesina de videos ── */
  /* Rotación automática con crossfade, sin interacción del usuario.
     Cada video avanza al siguiente cuando TERMINA de reproducirse (no en un
     tiempo fijo) — así ningún clip hace loop a la mitad solo porque otro es
     más largo, sin importar cuánto dure cada uno. Funciona con cualquier
     cantidad de .hero-video-slide — para agregar un video más, solo hay
     que duplicar el bloque HTML con sus propios archivos; este código los
     detecta solo. */
  (function heroMarquee() {
    const slides = Array.from(document.querySelectorAll('.hero-video-slide'));
    if (slides.length === 0) return;

    const MIN_DWELL = 3000;   // por si un video fuera muy corto, no pasar de largo demasiado rápido
    const FALLBACK_MAX = 20000; // por si 'ended' nunca llega (ej. autoplay bloqueado), no quedarse atorado
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const videoOf = (slide) => slide.querySelector('video');

    // Deja el primer video listo para reproducir de inmediato (es el LCP).
    const first = videoOf(slides[0]);
    if (first) first.play().catch(() => {});

    if (slides.length < 2 || reducedMotion) return;

    // Precarga el siguiente video con anticipación para que el crossfade no
    // se vea con un salto/carga a medias.
    function preload(index) {
      const v = videoOf(slides[index]);
      if (v && v.preload !== 'auto') {
        v.preload = 'auto';
        v.load();
      }
    }
    preload(1);

    let current = 0;
    let advanced = false;

    function goToNext() {
      if (advanced) return; // evita doble avance si 'ended' y el fallback llegan casi juntos
      advanced = true;

      const next = (current + 1) % slides.length;
      const currentVideo = videoOf(slides[current]);
      const nextVideo = videoOf(slides[next]);

      slides[current].classList.remove('is-active');
      slides[next].classList.add('is-active');
      if (nextVideo) {
        nextVideo.currentTime = 0;
        nextVideo.play().catch(() => {});
      }
      // Pausar el saliente tras completar el fade, para no gastar recursos
      // reproduciendo un video que no se ve.
      setTimeout(() => currentVideo && currentVideo.pause(), 1500);

      preload((next + 1) % slides.length);
      current = next;
      armSlide(current);
    }

    function armSlide(index) {
      advanced = false;
      const video = videoOf(slides[index]);
      const start = Date.now();
      if (video) {
        video.addEventListener('ended', () => {
          const elapsed = Date.now() - start;
          if (elapsed < MIN_DWELL) {
            setTimeout(goToNext, MIN_DWELL - elapsed);
          } else {
            goToNext();
          }
        }, { once: true });
      }
      // Red de seguridad: si por lo que sea 'ended' nunca dispara, igual avanza.
      setTimeout(goToNext, FALLBACK_MAX);
    }

    armSlide(0);
  })();

  /* ── Nav scroll behavior ── */
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── Mobile menu ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    closeAllDropdowns();
  }

  /* ── Nav dropdowns (Portfolio: Brands / Listings / Case Studies) ──
     Un mismo componente y comportamiento en desktop y mobile: clic para
     abrir/cerrar, clic afuera lo cierra, Escape lo cierra, un solo
     dropdown abierto a la vez. */
  const dropdowns = Array.from(document.querySelectorAll('.nav-item-dropdown'));

  function closeAllDropdowns() {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove('is-open');
      dropdown.querySelector('.nav-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    });
  }

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !dropdown.classList.contains('is-open');
      closeAllDropdowns();
      if (willOpen) {
        dropdown.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
    dropdown.querySelectorAll('.nav-dropdown-menu a').forEach((link) => {
      link.addEventListener('click', () => closeAllDropdowns());
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item-dropdown')) closeAllDropdowns();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
  });

  /* ── Intersection Observer for reveal animations ── */
  const observerConfig = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerConfig);

  // Generic reveals
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Metric items
  document.querySelectorAll('.metric-item').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.1) + 's';
    revealObserver.observe(el);
  });

  // Serve cards
  document.querySelectorAll('.serve-card').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.12) + 's';
    revealObserver.observe(el);
  });

  // Flow steps
  document.querySelectorAll('.flow-step').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.08) + 's';
    revealObserver.observe(el);
  });

  // Platform modules
  document.querySelectorAll('.platform-module').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.06) + 's';
    revealObserver.observe(el);
  });

  // Brand cards
  document.querySelectorAll('.brand-card').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.12) + 's';
    revealObserver.observe(el);
  });

  // Why items
  document.querySelectorAll('.why-item').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.07) + 's';
    revealObserver.observe(el);
  });


  /* ── Bar animations for case studies ── */
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.metric-mini-fill').forEach((bar, i) => {
          setTimeout(() => bar.classList.add('animate'), i * 150 + 200);
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.case-study-item').forEach(el => barObserver.observe(el));

  /* ── Form handler ── */
  function handleSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('.form-submit');
    const original = btn.textContent;
    btn.textContent = 'Message Sent — We\'ll Be In Touch';
    btn.style.background = 'var(--olive)';
    btn.style.color = 'var(--bone)';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.style.color = '';
    }, 4000);
  }

  /* ── Atelier ── */
  /* Las tarjetas se generan desde /content/atelier.json, que
     scripts/build-atelier.mjs regenera automáticamente en cada build a
     partir de los artículos publicados en content/atelier/*.md (vía CMS) */
  const atelierGrid = document.getElementById('atelier-grid');
  const atelierEmpty = document.getElementById('atelier-empty');
  if (atelierGrid) {
    fetch('/content/atelier.json')
      .then(res => (res.ok ? res.json() : []))
      .then(articles => {
        if (!Array.isArray(articles) || articles.length === 0) {
          if (atelierEmpty) atelierEmpty.style.display = 'block';
          return;
        }
        const formatDate = (iso) => {
          const d = new Date(iso);
          return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
        };
        articles.slice(0, 3).forEach((article, i) => {
          const card = document.createElement('a');
          card.href = `/atelier/${article.slug}/`;
          card.className = 'atelier-card reveal';
          card.style.transitionDelay = (i * 0.08) + 's';
          card.innerHTML = `
            <div class="atelier-card-image">
              <div class="atelier-card-image-bg" style="background-image:url('${article.cover}')"></div>
            </div>
            <p class="atelier-card-tag">${article.tag}</p>
            <p class="atelier-card-title">${article.title}</p>
            <p class="atelier-card-date">${formatDate(article.date)}</p>
          `;
          atelierGrid.appendChild(card);
          revealObserver.observe(card);
        });
      })
      .catch(() => {
        if (atelierEmpty) atelierEmpty.style.display = 'block';
      });
  }

  /* ── Portfolio marquee ── */
  /* Lee /content/portfolio.json (separado por completo de este componente:
     agregar, quitar, reordenar o cambiar una propiedad no toca este código).
     Interacción: scroll-snap nativo (drag táctil / trackpad ya funciona solo),
     más drag-to-scroll con mouse para desktop, flechas, dots y teclado. */
  const pfTrack = document.getElementById('pf-track');
  if (pfTrack) {
    const pfPrev = document.getElementById('pf-prev');
    const pfNext = document.getElementById('pf-next');
    const pfDots = document.getElementById('pf-dots');
    const pfEmpty = document.getElementById('pf-empty');
    const pfMarquee = document.getElementById('pf-marquee');

    fetch('/content/portfolio.json')
      .then(res => (res.ok ? res.json() : []))
      .then(properties => {
        if (!Array.isArray(properties) || properties.length === 0) {
          if (pfMarquee) pfMarquee.style.display = 'none';
          if (pfEmpty) pfEmpty.style.display = 'block';
          return;
        }
        renderPortfolio(properties);
      })
      .catch(() => {
        if (pfMarquee) pfMarquee.style.display = 'none';
        if (pfEmpty) pfEmpty.style.display = 'block';
      });

    function renderPortfolio(properties) {
      properties.forEach((p) => {
        const card = document.createElement('a');
        card.href = p.url;
        card.className = 'pf-card';
        card.setAttribute('target', '_blank');
        card.setAttribute('rel', 'noopener');
        const imageMarkup = p.image
          ? `<img src="${p.image}" alt="${p.imageAlt || p.name}" loading="lazy" width="380" height="507">`
          : `<div class="pf-card-image-pending" role="img" aria-label="${p.imageAlt || p.name}">
               <p class="pf-card-image-pending-mark">${p.name}</p>
               <p class="pf-card-image-pending-note">Fotografía próximamente</p>
             </div>`;
        card.innerHTML = `
          <div class="pf-card-image">${imageMarkup}</div>
          <p class="pf-card-category">${p.category || ''}</p>
          <p class="pf-card-name">${p.name}</p>
          <p class="pf-card-location">${p.location || ''}</p>
        `;
        pfTrack.appendChild(card);

        const dot = document.createElement('button');
        dot.className = 'pf-dot';
        dot.setAttribute('aria-label', `Ir a ${p.name}`);
        dot.addEventListener('click', () => {
          card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
        pfDots.appendChild(dot);
      });

      const cards = Array.from(pfTrack.querySelectorAll('.pf-card'));
      const dots = Array.from(pfDots.querySelectorAll('.pf-dot'));

      // Preload solo la primera imagen real (si existe) — es la única con valor en el LCP
      cards[0]?.querySelector('img')?.setAttribute('loading', 'eager');

      // Detecta cuál tarjeta está más cerca del centro visual del track, en
      // vez de un IntersectionObserver por umbral — en pantallas anchas más
      // de una tarjeta puede estar 100% visible a la vez, y un umbral simple
      // las marcaría "activas" a las dos al mismo tiempo.
      function updateActiveCard() {
        const trackRect = pfTrack.getBoundingClientRect();
        const centerX = trackRect.left + trackRect.width / 2;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const r = card.getBoundingClientRect();
          const cardCenter = r.left + r.width / 2;
          const dist = Math.abs(cardCenter - centerX);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        cards.forEach((c, i) => c.classList.toggle('pf-active', i === closest));
        dots.forEach((d, i) => d.classList.toggle('pf-dot-active', i === closest));
      }

      let pfScrollTimeout;
      pfTrack.addEventListener('scroll', () => {
        clearTimeout(pfScrollTimeout);
        pfScrollTimeout = setTimeout(updateActiveCard, 60);
      }, { passive: true });
      updateActiveCard();

      function step(direction) {
        const active = cards.find(c => c.classList.contains('pf-active')) || cards[0];
        const idx = cards.indexOf(active);
        const target = cards[Math.min(cards.length - 1, Math.max(0, idx + direction))];
        target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
      pfPrev.addEventListener('click', () => step(-1));
      pfNext.addEventListener('click', () => step(1));

      pfTrack.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      });

      // Drag-to-scroll con mouse en desktop (touch ya funciona nativo).
      // Nota: deliberadamente NO usamos setPointerCapture aquí — capturar el
      // puntero sobre el track rompe la navegación nativa de los <a> hijos
      // (bug conocido: el click deja de llegar al enlace incluso sin arrastre
      // real). Mouse events normales en window evitan el problema.
      let isDown = false, startX = 0, startScroll = 0, moved = false;
      pfTrack.addEventListener('mousedown', (e) => {
        isDown = true; moved = false;
        pfTrack.classList.add('dragging');
        startX = e.clientX;
        startScroll = pfTrack.scrollLeft;
      });
      window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        pfTrack.scrollLeft = startScroll - dx;
      });
      window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        pfTrack.classList.remove('dragging');
      });
      pfTrack.addEventListener('click', (e) => {
        if (moved) { e.preventDefault(); moved = false; }
      }, true);
    }
  }

  /* ── Brands marquee (Our Brands) ── */
  /* Mismo patrón que la marquesina de /portfolio: fetch de un JSON,
     render de tarjetas, drag-to-scroll con mouse (touch nativo), flechas,
     dots y teclado. Los datos viven en /content/brands.json — agregar,
     quitar o reordenar marcas es editar ese archivo, sin tocar este código. */
  const bmTrack = document.getElementById('bm-track');
  if (bmTrack) {
    const bmPrev = document.getElementById('bm-prev');
    const bmNext = document.getElementById('bm-next');
    const bmDots = document.getElementById('bm-dots');
    const bmMarquee = document.getElementById('bm-marquee');

    // Degradados monocromáticos de respaldo para marcas sin foto todavía —
    // se ve intencional, nunca roto. Rotan si hay más marcas que colores.
    const FALLBACK_GRADIENTS = [
      'linear-gradient(160deg, #2A2820 0%, #1A1A14 40%, #2C2A20 100%)',
      'linear-gradient(160deg, #242220 0%, #161512 40%, #262422 100%)',
      'linear-gradient(160deg, #302E2A 0%, #201F1B 40%, #322F2B 100%)',
    ];

    fetch('/content/brands.json')
      .then(res => (res.ok ? res.json() : []))
      .then(brands => {
        if (!Array.isArray(brands) || brands.length === 0) return;
        renderBrands(brands);
      })
      .catch(() => {});

    function renderBrands(brands) {
      brands.forEach((b, i) => {
        const card = document.createElement('a');
        card.href = b.url || '#contact';
        card.className = 'bm-card';
        card.innerHTML = `
          <div class="bm-card-bg" style="${b.image ? `background-image:url('${b.image}')` : `background:${FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]}`}"></div>
          <div class="bm-card-content">
            <div class="bm-card-tag">${b.tag || ''}</div>
            <div class="bm-card-name">${b.name}</div>
            <div class="bm-card-desc">${b.description || ''}</div>
            <span class="bm-card-cta">Explore</span>
          </div>
        `;
        bmTrack.appendChild(card);

        const dot = document.createElement('button');
        dot.className = 'bm-dot';
        dot.setAttribute('aria-label', `Ir a ${b.name}`);
        dot.addEventListener('click', () => {
          card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
        bmDots.appendChild(dot);
      });

      const cards = Array.from(bmTrack.querySelectorAll('.bm-card'));
      const dots = Array.from(bmDots.querySelectorAll('.bm-dot'));

      // Detecta cuál tarjeta está más cerca del centro visual del track,
      // en vez de un IntersectionObserver por umbral — con tarjetas anchas
      // en pantallas grandes, más de una puede estar 100% visible a la vez,
      // y un umbral simple las marcaría "activas" a las dos.
      function updateActiveCard() {
        const trackRect = bmTrack.getBoundingClientRect();
        const centerX = trackRect.left + trackRect.width / 2;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const r = card.getBoundingClientRect();
          const cardCenter = r.left + r.width / 2;
          const dist = Math.abs(cardCenter - centerX);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        cards.forEach((c, i) => c.classList.toggle('bm-active', i === closest));
        dots.forEach((d, i) => d.classList.toggle('bm-dot-active', i === closest));
      }

      let bmScrollTimeout;
      bmTrack.addEventListener('scroll', () => {
        clearTimeout(bmScrollTimeout);
        bmScrollTimeout = setTimeout(updateActiveCard, 60);
      }, { passive: true });
      updateActiveCard();

      function step(direction) {
        const active = cards.find(c => c.classList.contains('bm-active')) || cards[0];
        const idx = cards.indexOf(active);
        const target = cards[Math.min(cards.length - 1, Math.max(0, idx + direction))];
        target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
      bmPrev.addEventListener('click', () => step(-1));
      bmNext.addEventListener('click', () => step(1));

      bmTrack.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      });

      // Drag-to-scroll con mouse (sin setPointerCapture — rompe la
      // navegación nativa de los <a>, ver notas del marquee de portfolio).
      let isDown = false, startX = 0, startScroll = 0, moved = false;
      bmTrack.addEventListener('mousedown', (e) => {
        isDown = true; moved = false;
        bmTrack.classList.add('dragging');
        startX = e.clientX;
        startScroll = bmTrack.scrollLeft;
      });
      window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        bmTrack.scrollLeft = startScroll - dx;
      });
      window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        bmTrack.classList.remove('dragging');
      });
      bmTrack.addEventListener('click', (e) => {
        if (moved) { e.preventDefault(); moved = false; }
      }, true);
    }
  }
