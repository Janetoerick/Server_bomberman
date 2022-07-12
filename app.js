const express = require('express');
const path = require('path');
 
const cors = require('cors');
//const helmet = require('helmet');
//const morgan = require('morgan');
 
const app = express();
 
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
 
// app.use(helmet());
 
app.use(express.json());
 
//app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('register.html');
});

module.exports = app;
