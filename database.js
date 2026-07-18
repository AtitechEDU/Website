const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'app.db'));

function getVideoPriority(name) {
  const lower = (name || '').toLowerCase();

  if (lower.includes('html')) return 0;
  if (lower.includes('css')) return 1;
  if (lower.includes('javascript')) return 2;
  if (lower.includes('github')) return 3;
  if (lower.includes('react')) return 4;
  if (lower.includes('mongo')) return 5;
  if (lower.includes('todo') && lower.includes('mern')) return 6;
  if (lower.includes('deepseek')) return 7;
  if (lower.includes('e-commerce') || lower.includes('e commerce') || lower.includes('commerce')) return 8;
  if (lower.includes('mern') && lower.includes('chatapp')) return 9;
  return 100;
}

function sortVideos(videos) {
  return [...videos].sort((a, b) => {
    const rankA = getVideoPriority(a.name);
    const rankB = getVideoPriority(b.name);

    if (rankA !== rankB) return rankA - rankB;
    return a.name.localeCompare(b.name);
  });
}

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      company_name TEXT NOT NULL DEFAULT 'ATITECH EDU PVT LTD',
      tagline TEXT NOT NULL DEFAULT 'Empowering Careers Through Skill-Based Learning',
      hero_title TEXT NOT NULL DEFAULT 'Learn, Build, and Grow with Industry-Focused Training',
      hero_description TEXT NOT NULL DEFAULT 'ATITECH EDU PVT LTD offers hands-on learning in web development, MERN stack, programming, and modern digital skills for students and professionals.',
      phone1 TEXT NOT NULL DEFAULT '6397964720',
      phone2 TEXT NOT NULL DEFAULT '6395804360',
      email TEXT NOT NULL DEFAULT 'atitech.edu.pvt.ltd@gmail.com',
      twitter TEXT NOT NULL DEFAULT 'https://x.com/AtitechEDU',
      address1 TEXT NOT NULL DEFAULT 'MVN Athens, Gurgaon Road, Sohna, Haryana',
      address2 TEXT NOT NULL DEFAULT 'Sootmil Chauraha, Aligarh, Uttar Pradesh'
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      size INTEGER NOT NULL,
      mtime INTEGER NOT NULL
    );
  `);

  db.prepare(`INSERT OR IGNORE INTO settings (id) VALUES (1)`).run();
}

function getSettings() {
  return db.prepare('SELECT * FROM settings WHERE id = 1').get();
}

function saveSettings(payload) {
  const stmt = db.prepare(`
    UPDATE settings SET
      company_name = ?,
      tagline = ?,
      hero_title = ?,
      hero_description = ?,
      phone1 = ?,
      phone2 = ?,
      email = ?,
      twitter = ?,
      address1 = ?,
      address2 = ?
    WHERE id = 1
  `);
  stmt.run(
    payload.company_name,
    payload.tagline,
    payload.hero_title,
    payload.hero_description,
    payload.phone1,
    payload.phone2,
    payload.email,
    payload.twitter,
    payload.address1,
    payload.address2
  );
  return getSettings();
}

function addCourse(payload) {
  const stmt = db.prepare('INSERT INTO courses (title, description) VALUES (?, ?)');
  stmt.run(payload.title, payload.description);
}

function getCourses() {
  return db.prepare('SELECT * FROM courses ORDER BY id DESC').all();
}

function syncVideos(videos) {
  const sortedVideos = sortVideos(videos);
  const deleteStmt = db.prepare('DELETE FROM videos');
  deleteStmt.run();
  const insertStmt = db.prepare('INSERT INTO videos (name, size, mtime) VALUES (?, ?, ?)');
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertStmt.run(row.name, row.size, row.mtime);
  });
  insertMany(sortedVideos);
}

function getVideos() {
  const videos = db.prepare('SELECT * FROM videos ORDER BY mtime DESC').all();
  return sortVideos(videos);
}

module.exports = {
  initDb,
  getSettings,
  saveSettings,
  addCourse,
  getCourses,
  syncVideos,
  getVideos,
  sortVideos
};
