const express = require('express')
const mongoose = require('mongoose')
const nodemon = require('nodemon')
const adminRoute = require('./routes/admin');
const authRoute = require('./routes/auth');
const blogPostRoute = require('./routes/blogPost');
const searchRoute = require('./routes/search');
const profileRoute = require('./routes/userProfile');
const accountRoute = require('./routes/account');
const UserInteractionRoute = require('./routes/userInteraction');
const orderRoute = require('./routes/order');
const worksRoute = require('./routes/works')
const userProfile = require('./routes/userProfile')


const cors = require('cors');
require('dotenv').config()

const app = express()

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.t1ompdc.mongodb.net/tradewise`, { useNewUrlParser: true })
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.t1ompdc.mongodb.net/tradewise`, { useNewUrlParser: true })

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', ()=>{console.log("DB Connection Successfull")});

app.use(express.json());

app.use(cors());

app.use('/', authRoute);
app.use('/', UserInteractionRoute);
app.use('/', userProfile);
app.use('/admin', adminRoute);
app.use('/posts', blogPostRoute);
app.use('/search', searchRoute);
app.use("/profile", profileRoute);
app.use("/account", accountRoute);
app.use("/orders", orderRoute);
app.use('/works', worksRoute);


app.get('/', (req, res) => res.send('Hello World!'))

app.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}!`))