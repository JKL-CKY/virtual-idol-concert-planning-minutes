require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { initDB, getDB } = require('./database');
const emailService = require('./services/emailService');
const aiService = require('./services/aiService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

initDB().then(() => {
  console.log('Database initialized');
});

app.get('/api/meetings', async (req, res) => {
  try {
    const db = await getDB();
    const meetings = await db.all('SELECT * FROM meetings ORDER BY created_at DESC');
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/meetings/:id', async (req, res) => {
  try {
    const db = await getDB();
    const meeting = await db.get('SELECT * FROM meetings WHERE id = ?', req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    const participants = await db.all('SELECT * FROM participants WHERE meeting_id = ?', req.params.id);
    const transcripts = await db.all('SELECT * FROM transcripts WHERE meeting_id = ? ORDER BY start_time', req.params.id);
    const songs = await db.all('SELECT * FROM songs WHERE meeting_id = ?', req.params.id);
    const rundown = await db.get('SELECT * FROM rundowns WHERE meeting_id = ?', req.params.id);
    res.json({ meeting, participants, transcripts, songs, rundown });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meetings', async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const db = await getDB();
    const result = await db.run(
      'INSERT INTO meetings (title, date, description, status) VALUES (?, ?, ?, ?)',
      [title, date, description, 'draft']
    );
    res.json({ id: result.lastID, title, date, description, status: 'draft' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/meetings/:id', async (req, res) => {
  try {
    const { title, date, description, status } = req.body;
    const db = await getDB();
    await db.run(
      'UPDATE meetings SET title = ?, date = ?, description = ?, status = ? WHERE id = ?',
      [title, date, description, status, req.params.id]
    );
    res.json({ id: req.params.id, title, date, description, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meetings/:id/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }
    const db = await getDB();
    await db.run(
      'UPDATE meetings SET audio_path = ?, status = ? WHERE id = ?',
      [req.file.path, 'processing', req.params.id]
    );
    
    const pythonProcess = spawn(process.env.PYTHON_PATH || 'python', [
      path.join(__dirname, '../ai/process_audio.py'),
      req.file.path,
      req.params.id
    ]);
    
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python stdout: ${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });
    
    pythonProcess.on('close', async (code) => {
      console.log(`Python process exited with code ${code}`);
      if (code === 0) {
        await db.run('UPDATE meetings SET status = ? WHERE id = ?', ['transcribed', req.params.id]);
      } else {
        await db.run('UPDATE meetings SET status = ? WHERE id = ?', ['error', req.params.id]);
      }
    });
    
    res.json({ message: 'Audio uploaded and processing started', filePath: req.file.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meetings/:id/generate-rundown', async (req, res) => {
  try {
    const db = await getDB();
    const meeting = await db.get('SELECT * FROM meetings WHERE id = ?', req.params.id);
    const transcripts = await db.all('SELECT * FROM transcripts WHERE meeting_id = ? ORDER BY start_time', req.params.id);
    const participants = await db.all('SELECT * FROM participants WHERE meeting_id = ?', req.params.id);
    const songs = await db.all('SELECT * FROM songs WHERE meeting_id = ?', req.params.id);
    
    const result = await aiService.generateRundown(meeting, transcripts, participants, songs);
    
    await db.run(
      'INSERT OR REPLACE INTO rundowns (meeting_id, content, interactive_scripts, generated_at) VALUES (?, ?, ?, ?)',
      [req.params.id, JSON.stringify(result.rundown), JSON.stringify(result.interactiveScripts), new Date().toISOString()]
    );
    
    await db.run('UPDATE meetings SET status = ? WHERE id = ?', ['completed', req.params.id]);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meetings/:id/send-email', async (req, res) => {
  try {
    const { recipients } = req.body;
    const db = await getDB();
    const meeting = await db.get('SELECT * FROM meetings WHERE id = ?', req.params.id);
    const rundown = await db.get('SELECT * FROM rundowns WHERE meeting_id = ?', req.params.id);
    const participants = await db.all('SELECT * FROM participants WHERE meeting_id = ?', req.params.id);
    const songs = await db.all('SELECT * FROM songs WHERE meeting_id = ?', req.params.id);
    
    const markdown = emailService.generateMarkdownReport(meeting, rundown, participants, songs);
    await emailService.sendEmail(recipients, `虚拟偶像演唱会策划纪要 - ${meeting.title}`, markdown);
    
    res.json({ message: 'Email sent successfully', markdown });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/participants', async (req, res) => {
  try {
    const db = await getDB();
    const participants = await db.all('SELECT DISTINCT name, role FROM participants ORDER BY role');
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/characters', async (req, res) => {
  try {
    const db = await getDB();
    const characters = await db.all('SELECT * FROM characters ORDER BY id');
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/characters', async (req, res) => {
  try {
    const { name, description, model_path, voice_actor } = req.body;
    const db = await getDB();
    const result = await db.run(
      'INSERT INTO characters (name, description, model_path, voice_actor) VALUES (?, ?, ?, ?)',
      [name, description, model_path, voice_actor]
    );
    res.json({ id: result.lastID, name, description, model_path, voice_actor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stage-designs', async (req, res) => {
  try {
    const db = await getDB();
    const designs = await db.all('SELECT * FROM stage_designs ORDER BY created_at DESC');
    res.json(designs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stage-designs', upload.single('design'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const filePath = req.file ? req.file.path : null;
    const db = await getDB();
    const result = await db.run(
      'INSERT INTO stage_designs (name, description, image_path) VALUES (?, ?, ?)',
      [name, description, filePath]
    );
    res.json({ id: result.lastID, name, description, image_path: filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
