const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const URL = 'mongodb://localhost/HumanDB';

mongoose.connect(URL, { useNewUrlParser: true });

const con = mongoose.connection;
con.on('open', () => console.log('connected'));
con.on('error', () => console.log('error'));
app.use(express.json());

const humanRouter = require('./routes/human');
app.use('/human', humanRouter);

app.listen(port, () => console.log(`Listening on port ${port}`));