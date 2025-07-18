require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const {  mainRouter } = require('./routers');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use("/public", express.static(path.join(__dirname, "public")));

app.use('/', mainRouter);


const server = app.listen(3000, () => {
    console.log('http://localhost:3000 서버가 열렸습니다.');
});

