const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let dbInstance = null;

const DB_PATH = path.join(__dirname, '../database.sqlite');

async function getDB() {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  return dbInstance;
}

function initDB() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      db.run(`CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT,
        description TEXT,
        status TEXT DEFAULT 'draft',
        audio_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meeting_id INTEGER,
        name TEXT NOT NULL,
        role TEXT,
        FOREIGN KEY (meeting_id) REFERENCES meetings(id)
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS transcripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meeting_id INTEGER,
        speaker TEXT,
        role TEXT,
        content TEXT,
        start_time REAL,
        end_time REAL,
        FOREIGN KEY (meeting_id) REFERENCES meetings(id)
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meeting_id INTEGER,
        title TEXT,
        artist TEXT,
        duration TEXT,
        notes TEXT,
        FOREIGN KEY (meeting_id) REFERENCES meetings(id)
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS rundowns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meeting_id INTEGER UNIQUE,
        content TEXT,
        interactive_scripts TEXT,
        generated_at DATETIME,
        FOREIGN KEY (meeting_id) REFERENCES meetings(id)
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        model_path TEXT,
        voice_actor TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS stage_designs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='characters'", (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        if (rows.length > 0) {
          db.get("SELECT COUNT(*) as count FROM characters", (err, result) => {
            if (result.count === 0) {
              insertSampleData(db);
            }
            dbInstance = db;
            resolve(db);
          });
        } else {
          insertSampleData(db);
          dbInstance = db;
          resolve(db);
        }
      });
    });
  });
}

function insertSampleData(db) {
  const characters = [
    { name: '星瞳', description: '活力四射的虚拟偶像，擅长舞蹈', voice_actor: '张三', model_path: '/models/xingtong.glb' },
    { name: '阿梓', description: '温柔治愈系歌手，声线优美', voice_actor: '李四', model_path: '/models/azi.glb' },
    { name: '七海', description: '元气少女，擅长rap和电音', voice_actor: '王五', model_path: '/models/qihai.glb' }
  ];
  
  characters.forEach(char => {
    db.run('INSERT INTO characters (name, description, model_path, voice_actor) VALUES (?, ?, ?, ?)',
      [char.name, char.description, char.model_path, char.voice_actor]);
  });
  
  const designs = [
    { name: '星空舞台', description: '以星空为主题的梦幻舞台设计', image_path: '/uploads/stage1.jpg' },
    { name: '未来都市', description: '赛博朋克风格的科技感舞台', image_path: '/uploads/stage2.jpg' }
  ];
  
  designs.forEach(design => {
    db.run('INSERT INTO stage_designs (name, description, image_path) VALUES (?, ?, ?)',
      [design.name, design.description, design.image_path]);
  });
  
  console.log('Sample data inserted');
}

module.exports = { initDB, getDB };
