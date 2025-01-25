const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 3000;
const dburl = process.env.DB_URL;
const jwtSecret = process.env.JWT_SECRET;



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
    session({
        secret: jwtSecret,
        resave: false,
        saveUninitialized: true,
    })
);

mongoose.connect(dburl)
        .then(() => console.log("Connected to MongoDB"))
        .catch(err => console.log("Error connecting to MongoDB", err));

const noteRoutes = require("./routes/noteRoutes");
app.use("/", noteRoutes);


app.listen(port, () => console.log(`Server Listening on PORT:${port}`));


