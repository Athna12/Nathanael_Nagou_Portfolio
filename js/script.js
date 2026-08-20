
// Modules : scroll reveal, marquee pause, stagger, header behavior, smooth scroll

'use strict';

// Mesure dynamique de la hauteur du header
function getHeaderHeight() {
  const header = document.querySelector('.site-header');
  return header ? header.offsetHeight : 72;
}

// Rend visible un élément
function makeVisible(el) {
  el.classList.add('visible');
}

// Observe et révèle les éléments au scroll
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        makeVisible(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal, .phase-row').forEach(el => {
    observer.observe(el);
  });
}

// Respecte prefers-reduced-motion (accessibilité)
function initMarqueePause() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function applyMotionPreference(mq) {
    const lists = document.querySelectorAll('.marquee-list');
    lists.forEach(list => {
      list.style.animationPlayState = mq.matches ? 'paused' : 'running';
    });
  }

  applyMotionPreference(prefersReduced);
  prefersReduced.addEventListener('change', applyMotionPreference);
}

// Ajoute délai en cascade sur les éléments
function applyStagger(parentSel, childSel, stepSec = 0.1) {
  document.querySelectorAll(parentSel).forEach(parent => {
    parent.querySelectorAll(childSel).forEach((child, i) => {
      child.style.transitionDelay = (i * stepSec) + 's';
    });
  });
}

function initStagger() {
  document.querySelectorAll('.phase-row').forEach((row, i) => {
    row.style.transitionDelay = (i * 0.1) + 's';
  });

  document.querySelectorAll('.kpi-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 0.07) + 's';
  });
}

// Ombre du header au scroll
function initHeaderShadow() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 15);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

// Met à jour le lien nav actif
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('a[data-section]');
  if (!sections.length || !navLinks.length) return;

  const updateActiveLink = () => {
    let closestSection = null;
    let closestDistance = Infinity;
    const viewportCenter = window.innerHeight / 2;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = (rect.top + rect.bottom) / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestSection = section.id;
      }
    });

    if (closestSection) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === closestSection);
      });
    }
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}

function initHeaderBehavior() {
  initHeaderShadow();
  initActiveNavLink();
}

// Défilement fluide avec offset header
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - getHeaderHeight();
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}

// Lecture des vidéos de démo
// L'attribut `autoplay` est refusé en silence par certains navigateurs
// (économiseur d'énergie, onglet ouvert en arrière-plan, iOS bas niveau de batterie).
// On relance donc la lecture à l'entrée dans le viewport, puis au premier geste
// de l'utilisateur si le navigateur a rejeté la promesse de play().
function initDemoVideos() {
  const videos = document.querySelectorAll('video[autoplay]');
  if (!videos.length) return;

  const tryPlay = (video) => {
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {
        // Rejet probable de l'autoplay : on retente au premier geste.
        const retry = () => {
          video.play().catch(() => {});
          document.removeEventListener('pointerdown', retry);
          document.removeEventListener('keydown', retry);
        };
        document.addEventListener('pointerdown', retry, { once: true });
        document.addEventListener('keydown', retry, { once: true });
      });
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) tryPlay(entry.target);
        else entry.target.pause();
      });
    },
    { threshold: 0.25 }
  );

  videos.forEach(video => {
    // `muted` doit être posé en JS aussi : l'attribut seul ne suffit pas
    // toujours à débloquer l'autoplay sur WebKit.
    video.muted = true;
    observer.observe(video);
  });
}

// Menu burger mobile
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.header-nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Fermer après un clic sur un lien
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Fermer avec Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

// Point d'entrée
function init() {
  initStagger();
  initScrollReveal();
  initMarqueePause();
  initHeaderBehavior();
  initSmoothScroll();
  initMobileNav();
  initDemoVideos();
}

document.addEventListener('DOMContentLoaded', init);

