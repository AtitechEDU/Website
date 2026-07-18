const express = require('express');
const path = require('path');
const fs = require('fs');
const { initDb, getSettings, saveSettings, addCourse, getCourses, syncVideos, getVideos, sortVideos } = require('./database');

const app = express();
const port = process.env.PORT || 3000;
const rootDir = __dirname;
const videosDir = path.join(rootDir, 'videos');

app.use(express.static(rootDir));
app.use(express.json());

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

initDb();
syncVideos(listVideosFromFolder());

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.svg': return 'image/svg+xml';
    case '.mkv': return 'video/x-matroska';
    case '.mp4': return 'video/mp4';
    default: return 'application/octet-stream';
  }
}

function listVideosFromFolder() {
  return sortVideos(
    fs.readdirSync(videosDir)
      .filter((name) => fs.statSync(path.join(videosDir, name)).isFile())
      .map((name) => {
        const filePath = path.join(videosDir, name);
        const stat = fs.statSync(filePath);
        return { name, mtime: stat.mtime.getTime(), size: stat.size };
      })
  );
}

app.get('/api/settings', (req, res) => {
  res.json(getSettings());
});

app.post('/api/settings', (req, res) => {
  const settings = saveSettings(req.body);
  res.json({ message: 'Settings saved successfully!', settings });
});

app.get('/api/courses', (req, res) => {
  res.json(getCourses());
});

app.post('/api/courses', (req, res) => {
  addCourse(req.body);
  res.json({ message: 'Course added successfully!' });
});

app.get('/api/videos', (req, res) => {
  res.json(getVideos());
});

app.post('/api/sync-videos', (req, res) => {
  syncVideos(listVideosFromFolder());
  res.json({ message: 'Videos synced successfully!' });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(rootDir, 'admin.html'));
});

app.get('/lms', (req, res) => {
  res.sendFile(path.join(rootDir, 'lms.html'));
});

app.get('/lms-videos', (req, res) => {
  res.sendFile(path.join(rootDir, 'lms-videos.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.get('/mern-brochure.pdf', (req, res) => {
  const brochurePath = path.join(rootDir, 'MERN BROCHURE.pdf');
  if (!fs.existsSync(brochurePath)) {
    return res.status(404).send('Brochure not found');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="MERN BROCHURE.pdf"');
  return res.sendFile(brochurePath);
});

app.get('/videos/:name', (req, res) => {
  const videoPath = path.join(videosDir, req.params.name);
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video not found');
  }

  const stat = fs.statSync(videoPath);
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(videoPath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': getMimeType(videoPath)
    });
    return stream.pipe(res);
  }

  res.writeHead(200, {
    'Content-Length': stat.size,
    'Content-Type': getMimeType(videoPath)
  });
  return fs.createReadStream(videoPath).pipe(res);
});

app.use((req, res) => {
  const requestedFile = path.join(rootDir, req.path);
  if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
    res.sendFile(requestedFile);
    return;
  }
  res.status(404).send('Not Found');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
