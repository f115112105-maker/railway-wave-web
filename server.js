const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const pool = mysql.createPool({
  host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'FYJZb6j41fzyQZC.root',
  password: 'RG204EJbmdc5eJhS',
  database: 'railway_atc',
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10
});

app.get('/api/state', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM wave_sync_state WHERE id = 1');
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/state', async (req, res) => {
  try {
    const {
      file_name, channel, start_time, fft_points,
      hann_window, remove_dc, selected_hex_addr,
      waveform_json, fft_json, hex_table_json
    } = req.body;

    await pool.query(
      `UPDATE wave_sync_state SET 
        file_name = COALESCE(?, file_name),
        channel = COALESCE(?, channel),
        start_time = COALESCE(?, start_time),
        fft_points = COALESCE(?, fft_points),
        hann_window = COALESCE(?, hann_window),
        remove_dc = COALESCE(?, remove_dc),
        selected_hex_addr = COALESCE(?, selected_hex_addr),
        waveform_json = COALESCE(?, waveform_json),
        fft_json = COALESCE(?, fft_json),
        hex_table_json = COALESCE(?, hex_table_json)
      WHERE id = 1`,
      [
        file_name ?? null, channel ?? null, start_time ?? null, fft_points ?? null,
        hann_window ?? null, remove_dc ?? null, selected_hex_addr ?? null,
        waveform_json ?? null, fft_json ?? null, hex_table_json ?? null
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
