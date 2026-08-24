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
  }

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

  /* ── Map dot interactions ── */
  document.querySelectorAll('.map-dot').forEach(dot => {
    dot.addEventListener('mouseenter', () => {
      dot.style.transform = 'translate(-50%, -50%) scale(1.8)';
      dot.style.background = 'var(--sand)';
    });
    dot.addEventListener('mouseleave', () => {
      dot.style.transform = '';
      dot.style.background = '';
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
