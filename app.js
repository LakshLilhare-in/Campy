
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const campy = {}
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
const appName = ''
mongoose.connect('mongodb+srv://laksh:l123a@campy-storage-database.yjlsg.mongodb.net/campy?retryWrites=true&w=majority', {
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


const sessionConfig = {
    name: 'session',
    secret: 'L@0709_l',
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


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})



campy.listen = (port) => {
    if (port === undefined) {
        app.listen(1234,() => {
            console.log('Warning! :Application port is not specified.Continuing via the default port 1234')
        })
    }else {
    app.listen(port,() => {
        console.log(`Application ${appName} is serving on ${port}`)
    })}
    if (process.env.NODE_ENV !== "production") {
        console.log(`Hey there ,A quick tip in development! In Campy 2.0 Now you can set Enviorment variables to train app's cloudinary cloud target and MongoDB target 
        Database check README to see which enviorment variables to set`)
    }
}


    


    module.exports.listen = (enport) => {
    campy.listen(enport)
    }

    campy.listen(1234)