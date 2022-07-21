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

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
});

module.exports = app;
