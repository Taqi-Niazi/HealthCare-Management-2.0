// backend/server.js
require('dotenv').config();                // load .env into process.env
const express = require('express');        // express framework
const mongoose = require('mongoose');      // mongo ORM
const morgan = require('morgan');          // request logger
const cors = require('cors');              // enable CORS
const authRoutes = require('./routes/auth');

const apptRoutes = require('./routes/appointments');
const presRoutes = require('./routes/prescriptions');

app.use('/api/appointments', apptRoutes);
app.use('/api/prescriptions', presRoutes);

const app = express();
app.use(express.json());                   // parse JSON bodies
app.use(cors());                           // allow cross-origin requests
app.use(morgan('dev'));                    // log requests to console

// connect to MongoDB using env var MONGO_URI
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error:', err));

app.use('/api/auth', authRoutes);          // mount auth endpoints

app.get('/', (_,res) => res.send('HCMS2 API running'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server listening on ${PORT}`));
