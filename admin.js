async function loadSettings() {
  const res = await fetch('/api/settings');
  const data = await res.json();
  const form = document.getElementById('site-form');
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (field) field.value = value;
  });
}

async function saveSettings(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await res.json();
  document.getElementById('site-message').textContent = result.message;
}

async function addCourse(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());
  const res = await fetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await res.json();
  document.getElementById('course-message').textContent = result.message;
  event.target.reset();
}

async function syncVideos() {
  const res = await fetch('/api/sync-videos', { method: 'POST' });
  const result = await res.json();
  document.getElementById('sync-message').textContent = result.message;
}

document.getElementById('site-form').addEventListener('submit', saveSettings);
document.getElementById('course-form').addEventListener('submit', addCourse);
document.getElementById('sync-btn').addEventListener('click', syncVideos);
loadSettings();
