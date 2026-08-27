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

  /* ── Where We Operate: market switcher ── */
  const marketButtons = document.querySelectorAll('#markets-list .location-item');
  const marketPins = document.querySelectorAll('.market-pin');
  // Roma/Condesa y Centro son dos renglones de la lista pero un solo punto
  // en el mapa (son la misma ciudad) — se resuelven al mismo pin "cdmx".
  const pinForMarket = (market) => (market === 'roma-condesa' || market === 'centro') ? 'cdmx' : market;

  marketButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const market = btn.dataset.market;
      marketButtons.forEach(b => b.classList.toggle('is-active', b === btn));
      const activePin = pinForMarket(market);
      marketPins.forEach(p => p.classList.toggle('is-active', p.dataset.market === activePin));
    });
  });

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

      const pfObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const idx = cards.indexOf(entry.target);
          if (entry.intersectionRatio > 0.6) {
            entry.target.classList.add('pf-active');
            dots.forEach(d => d.classList.remove('pf-dot-active'));
            if (dots[idx]) dots[idx].classList.add('pf-dot-active');
          } else {
            entry.target.classList.remove('pf-active');
          }
        });
      }, { root: pfTrack, threshold: [0, 0.6, 1] });
      cards.forEach(c => pfObserver.observe(c));

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
