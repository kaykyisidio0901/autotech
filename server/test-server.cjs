const express = require('express');
const app = express();
app.get('/api/ping', (req, res) => res.json({ pong: true }));
app.listen(process.env.PORT || 3001, () => console.log('TEST server on ', process.env.PORT || 3001));
