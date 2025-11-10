// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

// 1️⃣ initialize app first
const app = express();

// 2️⃣ middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// 3️⃣ import routes (paths must be correct)
const authRoutes = require('./routes/auth');
const apptRoutes = require('./routes/appointments');
const presRoutes = require('./routes/prescriptions');

// 4️⃣ use routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', apptRoutes);
app.use('/api/prescriptions', presRoutes);

// 5️⃣ default route
app.get('/', (_, res) => res.send('HCMS2 API running'));

// 6️⃣ connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error:', err));

// 7️⃣ start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
