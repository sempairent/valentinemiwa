import express from 'express';
import mysql from 'mysql';
import cors from 'cors';

import { PORT, DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT } from './config.js';

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
});

db.connect(err => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + db.threadId);
});

app.get('/songs', (req, res) => {
  db.query('SELECT * FROM songs', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.get('/search', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).send('Query parameter is required');
  }

  const sqlQuery = `
    SELECT * FROM songs
    WHERE title LIKE ? OR artist LIKE ?
  `;
  const searchQuery = `%${query}%`;

  db.query(sqlQuery, [searchQuery, searchQuery], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log('Server running on port ', PORT);
});
