/* ==========================================================================
   LUCIANO CRUZ ADVOCACIA — script.js
   Comportamentos: menu mobile, header no scroll, tema claro/escuro,
   animações de entrada, validação de formulário, máscara de telefone,
   botão voltar ao topo e ano automático do rodapé.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. HEADER — muda de aparência ao rolar a página
     ------------------------------------------------------------------ */
  var header = document.getElementById('site-header');
  var scrollTicking = false;

  function updateHeaderState() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    scrollTicking = false;
  }

  function onScroll() {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateHeaderState);
      scrollTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeaderState();

  /* ------------------------------------------------------------------
     2. MENU MOBILE
     ------------------------------------------------------------------ */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  var mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  var mobileMenuClose = document.getElementById('mobile-menu-close');
  var mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  function openMobileMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenuOverlay.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('menu-open');
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenuOverlay.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains('is-open');
      isOpen ? closeMobileMenu() : openMobileMenu();
    });

    mobileMenuClose.addEventListener('click', closeMobileMenu);
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);

    mobileMenuLinks.forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });
  }

  /* ------------------------------------------------------------------
     3. TEMA CLARO / ESCURO
     ------------------------------------------------------------------ */
  var THEME_KEY = 'lc-theme';
  var themeToggleButtons = document.querySelectorAll('#theme-toggle');
  var htmlEl = document.documentElement;

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    themeToggleButtons.forEach(function (btn) {
      var isLight = theme === 'light';
      btn.setAttribute('aria-pressed', String(isLight));
      btn.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
    });
  }

  function getStoredTheme() {
    try {
      return window.localStorage.getItem(THEME_KEY);
    } catch (err) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      /* localStorage indisponível — segue sem persistir */
    }
  }

  /* O padrão é sempre o modo escuro (identidade oficial da marca),
     a menos que o visitante já tenha escolhido o modo claro antes. */
  applyTheme(getStoredTheme() === 'light' ? 'light' : 'dark');

  themeToggleButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      storeTheme(next);
    });
  });

  /* ------------------------------------------------------------------
     4. ANIMAÇÕES DE ENTRADA (IntersectionObserver)
     ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ------------------------------------------------------------------
     5. NAVEGAÇÃO ATIVA (destaca o link da seção visível)
     ------------------------------------------------------------------ */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-link');

  if (sections.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            var match = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', match);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(function (sec) { navObserver.observe(sec); });
  }

  /* ------------------------------------------------------------------
     6. BOTÃO VOLTAR AO TOPO
     ------------------------------------------------------------------ */
  var backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 560);
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     7. MÁSCARA DE TELEFONE
     ------------------------------------------------------------------ */
  var phoneField = document.getElementById('field-telefone');

  function maskPhone(value) {
    var digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.replace(/^(\d{0,2})/, '($1');
    if (digits.length <= 7) return digits.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }

  if (phoneField) {
    phoneField.addEventListener('input', function (e) {
      e.target.value = maskPhone(e.target.value);
    });
  }

  /* ------------------------------------------------------------------
     8. VALIDAÇÃO DO FORMULÁRIO DE CONTATO
     ------------------------------------------------------------------ */
  var form = document.getElementById('contact-form');

  if (form) {
    var feedback = document.getElementById('form-feedback');

    var validators = {
      nome: function (v) {
        return v.trim().length >= 3 ? '' : 'Informe seu nome completo.';
      },
      telefone: function (v) {
        var digits = v.replace(/\D/g, '');
        return digits.length >= 10 ? '' : 'Informe um telefone válido com DDD.';
      },
      email: function (v) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(v.trim()) ? '' : 'Informe um e-mail válido.';
      },
      assunto: function (v) {
        return v ? '' : 'Selecione um assunto.';
      },
      mensagem: function (v) {
        return v.trim().length >= 10 ? '' : 'Descreva brevemente sua situação (mínimo 10 caracteres).';
      },
      consentimento: function (v, field) {
        return field.checked ? '' : 'É necessário concordar com o tratamento dos dados.';
      }
    };

    function showFieldError(name, message) {
      var field = form.elements[name];
      var errorEl = document.getElementById('error-' + name);
      var wrapper = field ? field.closest('.form-field') : null;

      if (wrapper) wrapper.classList.toggle('has-error', Boolean(message));
      if (errorEl) errorEl.textContent = message;
      if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validateField(name) {
      var field = form.elements[name];
      if (!field || !validators[name]) return true;
      var value = field.type === 'checkbox' ? field.checked : field.value;
      var message = validators[name](value, field);
      showFieldError(name, message);
      return !message;
    }

    Object.keys(validators).forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      var evt = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'blur';
      field.addEventListener(evt, function () { validateField(name); });
    });

    form.addEventListener('submit', function (e) {
      var isValid = Object.keys(validators)
        .map(validateField)
        .every(Boolean);

      if (!isValid) {
        e.preventDefault();
        if (feedback) {
          feedback.textContent = 'Verifique os campos destacados antes de enviar.';
        }
        var firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      if (feedback) {
        feedback.textContent = 'Enviando sua mensagem...';
      }
      /* formulário segue para o FormSubmit normalmente quando válido */
    });
  }

  /* ------------------------------------------------------------------
     9. ANO AUTOMÁTICO NO RODAPÉ
     ------------------------------------------------------------------ */
  var footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }

})();
