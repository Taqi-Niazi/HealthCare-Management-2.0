// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

// ✅ Import email utility
const sendEmail = require('./utils/emailService');

// 1️⃣ Initialize app
const app = express();

// 2️⃣ Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// 3️⃣ Import routes
const authRoutes = require('./routes/auth');
const apptRoutes = require('./routes/appointments');
const presRoutes = require('./routes/prescriptions');

require('./utils/scheduler');

// 4️⃣ Use routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', apptRoutes);
app.use('/api/prescriptions', presRoutes);

// 5️⃣ Default route
app.get('/', (_, res) => res.send('HCMS2 API running'));

// ✅ 6️⃣ Test email route
app.get('/test-email', async (req, res) => {
  try {
    await sendEmail(
      process.env.EMAIL_USER, // it will send the test mail to yourself
      'Test Email from HCMS2.0',
      'If you received this, your email setup works correctly!'
    );
    res.send('✅ Test email sent successfully!');
  } catch (err) {
    console.error('❌ Error sending test email:', err);
    res.status(500).send('❌ Failed to send test email.');
  }
});

// 7️⃣ Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error:', err));

// 8️⃣ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
