require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ensure the routes are correctly prefixed with '/api/auth'
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);


const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
