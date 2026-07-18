async function loadSiteSettings() {
  try {
    const settings = await fetch('/api/settings').then((res) => res.json());

    const companyName = document.getElementById('site-company-name');
    const tagline = document.getElementById('site-tagline');
    const heroTitle = document.getElementById('hero-title');
    const heroDescription = document.getElementById('hero-description');
    const phone1Link = document.getElementById('phone1-link');
    const phone2Link = document.getElementById('phone2-link');
    const emailLink = document.getElementById('email-link');
    const twitterLink = document.getElementById('twitter-link');
    const address1 = document.getElementById('address1');
    const address2 = document.getElementById('address2');

    if (companyName) companyName.textContent = settings.company_name;
    if (tagline) tagline.textContent = settings.tagline;
    if (heroTitle) heroTitle.textContent = settings.hero_title;
    if (heroDescription) heroDescription.textContent = settings.hero_description;
    if (phone1Link) {
      phone1Link.href = `tel:${settings.phone1}`;
      phone1Link.textContent = settings.phone1;
    }
    if (phone2Link) {
      phone2Link.href = `tel:${settings.phone2}`;
      phone2Link.textContent = settings.phone2;
    }
    if (emailLink) {
      emailLink.href = `mailto:${settings.email}`;
      emailLink.textContent = settings.email;
    }
    if (twitterLink) {
      twitterLink.href = settings.twitter;
      twitterLink.textContent = settings.twitter.replace('https://x.com/', '@');
    }
    if (address1) address1.textContent = settings.address1;
    if (address2) address2.textContent = settings.address2;
  } catch (error) {
    console.error('Unable to load settings', error);
  }
}

async function loadCourses() {
  const container = document.getElementById('courses-list');
  if (!container) return;

  try {
    const courses = await fetch('/api/courses').then((res) => res.json());

    if (!courses.length) {
      return;
    }

    container.innerHTML = courses.map((course) => `
      <article class="card">
        <h4>${course.title}</h4>
        <p>${course.description}</p>
      </article>
    `).join('');
  } catch (error) {
    container.innerHTML = '<article class="card"><h4>Unable to load courses</h4><p>Please try again later.</p></article>';
  }
}

async function loadVideos() {
  const container = document.getElementById('lms-videos');
  if (!container) return;

  try {
    const videos = await fetch('/api/videos').then((res) => res.json());

    if (!videos.length) {
      container.innerHTML = '<p class="intro-text">No videos found in the folder yet.</p>';
      return;
    }

    container.innerHTML = videos.map((video) => {
      const date = new Date(video.mtime).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      const size = (video.size / (1024 * 1024)).toFixed(2) + ' MB';
      const displayName = video.name.replace(/\.(mkv|mp4|webm)$/i, '');

      return `
        <article class="video-card">
          <div class="video-meta">
            <h3>${displayName}</h3>
            <p><strong>Updated:</strong> ${date}</p>
            <p><strong>Size:</strong> ${size}</p>
          </div>
          <video controls controlsList="nodownload" preload="metadata" src="/videos/${encodeURIComponent(video.name)}"></video>
        </article>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = '<p class="intro-text">Unable to load videos right now.</p>';
  }
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const savedTheme = localStorage.getItem('atitech-theme') || 'light';
  document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  toggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('atitech-theme', isDark ? 'dark' : 'light');
    toggle.textContent = isDark ? '☀️' : '🌙';
  });
}

function initScrollReveal() {
  const sections = document.querySelectorAll('.reveal-section');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  });

  sections.forEach((section) => observer.observe(section));
}

function initBoxInteractions() {
  const boxes = document.querySelectorAll('.card, .video-card, .highlight-card, .stat-card');

  const activateBox = (box) => {
    boxes.forEach((item) => item.classList.remove('is-active'));
    box.classList.add('is-active');
  };

  boxes.forEach((box) => {
    box.addEventListener('pointerdown', () => activateBox(box));
    box.addEventListener('click', () => activateBox(box));
  });
}

function initLmsAuth() {
  const loginView = document.getElementById('login-view');
  const form = document.getElementById('lms-login-form');
  const emailInput = document.getElementById('lms-email');
  const passwordInput = document.getElementById('lms-password');
  const errorEl = document.getElementById('login-error');
  const userEmailLabel = document.getElementById('user-email');
  const logoutButton = document.getElementById('logout-button');

  if (window.location.pathname === '/lms-videos' || window.location.pathname === '/lms-videos.html') {
    const isAuthenticated = localStorage.getItem('atitech-lms-auth') === 'true';
    if (!isAuthenticated) {
      window.location.href = '/lms';
      return;
    }

    const storedEmail = localStorage.getItem('atitech-lms-email') || 'Learner';
    if (userEmailLabel) {
      userEmailLabel.textContent = `Signed in as ${storedEmail}`;
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        localStorage.removeItem('atitech-lms-auth');
        localStorage.removeItem('atitech-lms-email');
        window.location.href = '/lms';
      });
    }

    return;
  }

  if (!loginView || !form) return;

  const fixedPassword = 'Eduhub@123';

  function setAuthState(isLoggedIn, email = 'Learner') {
    if (isLoggedIn) {
      localStorage.setItem('atitech-lms-auth', 'true');
      localStorage.setItem('atitech-lms-email', email);
      window.location.href = '/lms-videos';
      return;
    }

    loginView.hidden = false;
    if (errorEl) {
      errorEl.textContent = '';
    }
    localStorage.removeItem('atitech-lms-auth');
    localStorage.removeItem('atitech-lms-email');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = (emailInput?.value || '').trim();
    const password = passwordInput?.value || '';

    if (!email || !email.includes('@')) {
      if (errorEl) {
        errorEl.textContent = 'Please enter a valid email address.';
      }
      return;
    }

    if (password !== fixedPassword) {
      if (errorEl) {
        errorEl.textContent = 'Incorrect password.';
      }
      return;
    }

    if (errorEl) {
      errorEl.textContent = '';
    }
    form.reset();
    setAuthState(true, email);
  });

  const isAuthenticated = localStorage.getItem('atitech-lms-auth') === 'true';
  if (isAuthenticated) {
    window.location.href = '/lms-videos';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initThemeToggle();
  initScrollReveal();
  initBoxInteractions();
  initLmsAuth();
  await loadSiteSettings();
});
