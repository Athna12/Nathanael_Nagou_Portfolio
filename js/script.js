/* ============================================================
   script.js — Nathanaël NAGOU Portfolio
   Modules :
     1. initScrollReveal      — apparition des éléments au scroll
     2. initMarqueePause      — pause du défilement au survol (accessibilité)
     3. initStagger           — délais en cascade sur les cartes
     4. initHeaderBehavior    — ombre + lien actif de la nav
     5. initSmoothScroll      — défilement fluide avec offset header
   ============================================================ */

'use strict';

/* ── CONSTANTES ───────────────────────────────────────────── */

/** Hauteur de la barre de navigation fixe en px */
const HEADER_HEIGHT = 72;

/* ── 1. SCROLL REVEAL ─────────────────────────────────────── */

/**
 * Rend visible un élément en ajoutant la classe CSS `.visible`.
 * @param {Element} el
 */
function makeVisible(el) {
  el.classList.add('visible');
}

/**
 * Observe les éléments animables et les révèle à leur entrée dans le viewport.
 */
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

  document.querySelectorAll('.reveal, .phase-row, .creation-item').forEach(el => {
    observer.observe(el);
  });
}

/* ── 2. MARQUEE — ACCESSIBILITÉ ───────────────────────────── */

/**
 * Respecte la préférence `prefers-reduced-motion` :
 * si l'utilisateur a activé "Réduire les animations" dans son OS,
 * les pistes du marquee sont mises en pause immédiatement.
 *
 * Le CSS gère déjà la pause au survol souris (.section-stack:hover).
 * Cette fonction couvre le cas des utilisateurs qui préfèrent
 * ne pas avoir d'animations en mouvement constant.
 */
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

/* ── 3. STAGGER ───────────────────────────────────────────── */

/**
 * Ajoute un délai progressif sur les éléments enfants d'un conteneur
 * pour créer un effet de cascade lors de leur révélation.
 *
 * @param {string} parentSel  - sélecteur CSS du conteneur
 * @param {string} childSel   - sélecteur CSS des enfants
 * @param {number} stepSec    - délai en secondes entre chaque enfant
 */
function applyStagger(parentSel, childSel, stepSec = 0.1) {
  document.querySelectorAll(parentSel).forEach(parent => {
    parent.querySelectorAll(childSel).forEach((child, i) => {
      child.style.transitionDelay = (i * stepSec) + 's';
    });
  });
}

function initStagger() {
  /* Étapes de la frise zigzag */
  document.querySelectorAll('.phase-row').forEach((row, i) => {
    row.style.transitionDelay = (i * 0.1) + 's';
  });

  /* Projets (liste éditoriale) */
  document.querySelectorAll('.creation-item').forEach((item, i) => {
    item.style.transitionDelay = (i * 0.08) + 's';
  });

  /* KPI cards du profil */
  document.querySelectorAll('.kpi-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 0.07) + 's';
  });
}

/* ── 4. COMPORTEMENT DU HEADER ────────────────────────────── */

/**
 * Ajoute `.scrolled` au header dès que la page défile
 * pour activer l'ombre portée CSS.
 */
function initHeaderShadow() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 15);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

/**
 * Met en évidence le lien de navigation correspondant à la section
 * actuellement visible dans le viewport.
 */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.header-nav a[data-section]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => observer.observe(s));
}

function initHeaderBehavior() {
  initHeaderShadow();
  initActiveNavLink();
}

/* ── 5. SMOOTH SCROLL ─────────────────────────────────────── */

/**
 * Intercepte les clics sur les ancres internes `href="#..."` et effectue
 * un défilement fluide en compensant la hauteur fixe du header.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}

/* ── INIT ─────────────────────────────────────────────────── */

/**
 * Point d'entrée principal.
 * L'ordre d'appel est important : stagger avant reveal.
 */
function init() {
  initStagger();          // délais cascade AVANT l'observer
  initScrollReveal();     // révélations au scroll
  initMarqueePause();     // respect prefers-reduced-motion
  initHeaderBehavior();   // ombre + lien actif
  initSmoothScroll();     // scroll fluide
}

document.addEventListener('DOMContentLoaded', init);

