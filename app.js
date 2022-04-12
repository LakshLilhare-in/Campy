
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const Razorpay = require('razorpay');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const mongoSanitize = require('express-mongo-sanitize');


const MongoDBStore =require('connect-mongo')
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const { emitWarning } = require('process');
const appName = '';

mongoose.connect(process.env.database, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

function err(err){
   return new Error('Could not reach to the database')
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Could not reach to the database '));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

var instance = new Razorpay({  key_id: 'rzp_test_goIy2Z5ts1LU9O',  key_secret: 'zgii6uoMqsX75ZPyAPEtMLAu',});

const sessionConfig = {
    name: 'session',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: MongoDBStore.create({
        mongoUrl: process.env.database,
        touchAfter: 24 * 60 * 60 // time period in seconds
      })
}

app.use(session(sessionConfig));
app.use(flash());



app.use(express.static(path.join(__dirname,'aurora/')))


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'aurora/index.html'))
});


app.get('/donate', (req,res) => {
       res.render('donate')
    })



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


app.listen(3000,() => {
  console.log('App Serving on localhost:3000')
})

    

