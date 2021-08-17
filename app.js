

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
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');


const MongoDBStore =require('connect-mongo')
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const { emitWarning } = require('process');
const { crossOriginResourcePolicy } = require('helmet');

mongoose.connect('localhost:27017/campy', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

function err(err){
   return new Error('Could not reach to the database')
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Could not reach to the database'));
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

// const sessionMongomaker = new MongoDBStore({
//     url:'mongodb+srv://laksh:l123a@campy-storage-database.yjlsg.mongodb.net/campy?retryWrites=true&w=majority',
//     secret:'L@0709_l',
//     touchAfter: 24 * 60 * 60
// })
// store.on('error',() => {
//     console.log('Mongo Session Storage Error')
// })
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
        mongoUrl: 'mongodb+srv://laksh:l123a@campy-storage-database.yjlsg.mongodb.net/campy?retryWrites=true&w=majority',
        touchAfter: 24 * 60 * 60 // time period in seconds
      })
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


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
    res.render('home')
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
        console.log(`Hey there ,A quick tip in development! You can change Line 31 mongoose.connect function's first param and cloudinary/index.js cloudinary.config`)
    }
}


    


    module.exports.listen = (enport) => {
    campy.listen(enport)
    }