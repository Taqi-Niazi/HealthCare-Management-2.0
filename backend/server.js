require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
app.use(require('cors')());

mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log('Mongo connected'))
  .catch(e=>console.error(e));

app.get('/', (_,res)=>res.send('HCMS2 API running'));
app.listen(process.env.PORT||5000, ()=>console.log('Server up'));
