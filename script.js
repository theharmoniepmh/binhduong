/* =============================================================
   THE HARMONIE LANDING PAGE - JavaScript
   Handles: form submission, gallery, animations, counter
   ============================================================= */

const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzJK4QzwQwz1e15nKGZ_JFm6kdLunIL656IgRN2Zo49ayhb0YkMZ4duC8igna7PU3pTig/exec';
const CHAT_LINKS = {
  zalo: 'https://zalo.me/587411079196412533',
  messenger: 'REPLACE_WITH_FACEBOOK_PAGE_MESSENGER_LINK'
};

document.addEventListener('DOMContentLoaded', () => {
  initChatLinks();
  initParticles();
  initCountUp();
  initGallery();
  initScrollReveal();
  initHighlightCards();
  initFinanceCards();
  initCardInViewMotion();
  initLeadForms();
  initCountdown();
  initStickyCta();
  initExitPopup();
});

function initChatLinks() {
  setChatLink(
    'zaloFloatLink',
    CHAT_LINKS.zalo,
    'Bot Zalo chưa được cấu hình đúng. Hãy thay link Zalo OA trong script.js.'
  );
  setChatLink(
    'messengerFloatLink',
    CHAT_LINKS.messenger,
    'Hiện tại chưa hỗ trợ Facebook Messenger'
  );
}

function setChatLink(id, url, disabledMessage) {
  const el = document.getElementById(id);
  if (!el) return;

  const configured = url && !url.includes('REPLACE_WITH_');

  if (configured) {
    el.href = url;
    el.target = '_blank';
    el.rel = 'noopener';
    el.classList.remove('is-disabled');
    el.removeAttribute('aria-disabled');
    el.removeAttribute('title');
    return;
  }

  el.href = '#contact-form';
  el.classList.add('is-disabled');
  el.setAttribute('aria-disabled', 'true');
  el.setAttribute('title', disabledMessage);
  el.addEventListener('click', (e) => {
    e.preventDefault();
    showChatToast(disabledMessage);
  });
}

function showChatToast(message) {
  const toast = document.getElementById('chatToast');
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__chatToastTimer);
  window.__chatToastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 25; i += 1) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 6}s`;
    particle.style.animationDuration = `${4 + Math.random() * 4}s`;
    particle.style.width = `${2 + Math.random() * 3}px`;
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

function initCountUp() {
  const nums = document.querySelectorAll('.stat-number[data-target]');
  if (!nums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCount(el, target);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach((el) => observer.observe(el));
}

function animateCount(el, target) {
  const duration = 2000;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(tick);
}

function initGallery() {
  const track = document.getElementById('galleryTrack');
  const dotsContainer = document.getElementById('galleryDots');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');

  if (!track || !dotsContainer || !prevBtn || !nextBtn) return;

  const slides = track.querySelectorAll('.gallery-slide');
  let current = 0;
  let autoSlide;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('gallery-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    current = ((index % slides.length) + slides.length) % slides.length;
    track.style.setProperty('--current-slide', current);

    dotsContainer.querySelectorAll('.gallery-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });

    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goTo(current + 1);
      } else {
        goTo(current - 1);
      }
    }
  }, { passive: true });

  resetAuto();
}

function initScrollReveal() {
  const cards = document.querySelectorAll('.highlight-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  cards.forEach((card) => observer.observe(card));
}

function initHighlightCards() {
  const cards = document.querySelectorAll('[data-highlight-card]');
  if (!cards.length) return;

  const activate = (selectedCard) => {
    cards.forEach((card) => {
      card.classList.toggle('is-active', card === selectedCard);
    });
  };

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => activate(card));
    card.addEventListener('click', () => activate(card));
    card.addEventListener('focus', () => activate(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(card);
      }
    });
  });

  activate(cards[0]);
}

function initFinanceCards() {
  const cards = document.querySelectorAll('[data-policy-card]');
  if (!cards.length) return;

  const activate = (selectedCard) => {
    cards.forEach((card) => {
      card.classList.toggle('is-active', card === selectedCard);
    });
  };

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => activate(card));
    card.addEventListener('click', () => activate(card));
    card.addEventListener('focus', () => activate(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(card);
      }
    });
  });

  activate(cards[0]);
}

function initCardInViewMotion() {
  const cards = document.querySelectorAll(
    '.panel-card, .fact-card, .trust-card, .highlight-card, .silicon-card, .unit-card, .connection-shell, .connection-point, .proof-video-card, .proof-quote-card, .finance-card'
  );
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-inview', entry.isIntersecting);
    });
  }, {
    threshold: 0.35,
    rootMargin: '0px 0px -12% 0px'
  });

  cards.forEach((card) => observer.observe(card));
}

function initLeadForms() {
  const forms = document.querySelectorAll('#leadForm');
  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitLeadForm(form);
    });
  });
}

async function submitLeadForm(form) {
  clearFormErrors(form);

  const name = form.querySelector('[name="name"]');
  const phone = form.querySelector('[name="phone"]');
  const product = form.querySelector('[name="product"]');
  const purpose = form.querySelector('[name="purpose"]');
  const sourceInput = form.querySelector('[name="source"]');
  let valid = true;

  if (!name || !name.value.trim()) {
    showFormError(form, 'name', 'Vui lòng nhập họ tên');
    valid = false;
  }

  const phoneVal = phone ? phone.value.replace(/\D/g, '') : '';
  if (!phoneVal || phoneVal.length < 9 || phoneVal.length > 11) {
    showFormError(form, 'phone', 'Số điện thoại không hợp lệ');
    valid = false;
  }

  if (product && !product.value) {
    showFormError(form, 'product', 'Vui lòng chọn loại căn hộ');
    valid = false;
  }

  if (purpose && !purpose.value) {
    showFormError(form, 'purpose', 'Vui lòng chọn mục đích');
    valid = false;
  }

  if (!valid) return;

  const btn = form.querySelector('button[type="submit"]');
  const btnText = btn ? btn.querySelector('.btn-text') : null;
  const btnLoading = btn ? btn.querySelector('.btn-loading') : null;

  if (btn) btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnLoading) btnLoading.style.display = 'inline-flex';

  const source = 'Landing Page';
  if (sourceInput) sourceInput.value = source;

  const payload = {
    name: name.value.trim(),
    phone: `'${phoneVal}`,
    product: product ? product.value : 'Chưa rõ, cần tư vấn',
    purpose: purpose ? purpose.value : 'Đang tìm hiểu',
    source
  };

  try {
    const gasConfigured = GAS_ENDPOINT && GAS_ENDPOINT !== 'YOUR_GAS_WEB_APP_URL_HERE';
    if (!gasConfigured) {
      throw new Error('Landing page chưa được nối Web App Google Apps Script.');
    }

    await fetch(GAS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    document.getElementById('successOverlay').style.display = 'flex';
    form.reset();
  } catch (err) {
    console.error('Submit error:', err);
    showChatToast('Form chưa được nối backend live hoặc Web App GAS chưa sẵn sàng. Dữ liệu hiện chưa đổ về Google Sheet.');
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoading) btnLoading.style.display = 'none';
  }
}

function clearFormErrors(form) {
  form.querySelectorAll('.field-error').forEach((el) => {
    el.textContent = '';
  });
  form.querySelectorAll('.error').forEach((el) => {
    el.classList.remove('error');
  });
}

function showFormError(form, field, msg) {
  const errorEl =
    form.querySelector(`[data-error-for="${field}"]`) ||
    document.getElementById(`error-${field}`);
  const inputEl =
    form.querySelector(`[name="${field}"]`) ||
    document.getElementById(`input-${field}`);

  if (errorEl) {
    errorEl.textContent = msg;
  }

  if (inputEl) {
    inputEl.classList.add('error');
  }
}

function initCountdown() {
  const cdWrap = document.getElementById('countdownWrap');
  if (!cdWrap) return;

  const dEl = document.getElementById('cd-days');
  const hEl = document.getElementById('cd-hours');
  const mEl = document.getElementById('cd-mins');
  const sEl = document.getElementById('cd-secs');

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7);
  targetDate.setHours(23, 59, 59, 0);

  function update() {
    const now = Date.now();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      clearInterval(interval);
      dEl.textContent = '00';
      hEl.textContent = '00';
      mEl.textContent = '00';
      sEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    dEl.textContent = days.toString().padStart(2, '0');
    hEl.textContent = hours.toString().padStart(2, '0');
    mEl.textContent = minutes.toString().padStart(2, '0');
    sEl.textContent = seconds.toString().padStart(2, '0');
  }

  update();
  const interval = setInterval(update, 1000);
}

function initStickyCta() {
  const stickyCta = document.getElementById('stickyCta');
  const heroBtn = document.getElementById('btn-hero-cta');
  const contactSection = document.getElementById('contact-form');
  if (!stickyCta || !heroBtn || !contactSection) return;

  const toggleSticky = () => {
    const heroBtnBottom = heroBtn.getBoundingClientRect().bottom;
    const isPastHero = heroBtnBottom < 0;

    const contactRect = contactSection.getBoundingClientRect();
    const isNearForm = contactRect.top <= window.innerHeight - 160;

    stickyCta.classList.toggle('show', isPastHero && !isNearForm);
    stickyCta.classList.toggle('is-hidden', isNearForm);
  };

  toggleSticky();
  window.addEventListener('scroll', toggleSticky, { passive: true });
  window.addEventListener('resize', toggleSticky);
}

function initExitPopup() {
  const exitPopup = document.getElementById('exitPopup');
  const exitClose = document.getElementById('exitClose');
  let hasShown = false;

  if (!exitPopup) return;

  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0 && !hasShown) {
      showPopup();
    }
  });

  let lastScrollTop = window.scrollY;
  let lastScrollTime = Date.now();

  window.addEventListener('scroll', () => {
    if (hasShown) return;

    const currentScrollTop = window.scrollY;
    const currentTime = Date.now();
    const timeDiff = currentTime - lastScrollTime;
    const scrollDiff = lastScrollTop - currentScrollTop;

    if (scrollDiff > 50 && timeDiff < 100) {
      showPopup();
    }

    lastScrollTop = currentScrollTop;
    lastScrollTime = currentTime;
  }, { passive: true });

  function showPopup() {
    exitPopup.style.display = 'flex';
    hasShown = true;
  }

  if (exitClose) {
    exitClose.addEventListener('click', () => {
      exitPopup.style.display = 'none';
    });
  }

  exitPopup.addEventListener('click', (e) => {
    if (e.target === exitPopup) {
      exitPopup.style.display = 'none';
    }
  });
}
