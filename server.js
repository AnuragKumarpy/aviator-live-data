// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;

// CORS: Allow iframe to send data
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.use(express.json());

app.post('/round', (req, res) => {
  const data = req.body;
  console.log('[SERVER] Saved:', data.endMultiplier);

  const filePath = path.join(__dirname, 'aviator_rounds.json');
  let rounds = [];

  if (fs.existsSync(filePath)) {
    try {
      rounds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {}
  }

  rounds.push(data);
  fs.writeFileSync(filePath, JSON.stringify(rounds, null, 2));

  res.json({ status: 'saved' });
});

// Auto-push to GitHub every 5 minutes
function gitPush() {
  exec('git add . && git commit -m "Live round $(date)" && git push', (err, stdout, stderr) => {
    if (err) console.error('[GIT] Push failed:', err);
    else console.log('[GIT] Pushed to GitHub');
  });
}
setInterval(gitPush, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT}`);
  console.log(`[SERVER] Forward port → Make Public → Use this URL in scraper`);
});