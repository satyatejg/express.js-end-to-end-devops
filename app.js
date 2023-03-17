if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// console.log(process.env.SECRET);
console.log(process.env.CLOUDINARY_KEY);

const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Review = require('./models/review');
const Campground = require('./models/campground');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const dbUrl = process.env.DB_URL;


const session = require('express-session');
const flash = require('connect-flash');

const MongoStore = require('connect-mongo');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/reviews');


// mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
//     .then(() => {
//         console.log('MONGO CONNECTION OPEN');
//     })
//     .catch(err => {
//         console.log('OH NO MONGO CONNECTION ERR');
//         console.log(err);
//     })
// mongoose.set('strictQuery', false);

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('MONGO CONNECTION OPEN');
    })
    .catch(err => {
        console.log('OH NO MONGO CONNECTION ERR');
        console.log(err);
    })
mongoose.set('strictQuery', false);



app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const store = MongoStore.create({
    // mongoUrl: 'mongodb://127.0.0.1:27017/yelp-camp',
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisistemporary'
    }
});

store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e);
})

const sessionConfig = {
    store,
    name: 'pandu',
    secret: 'thisistemporary',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
// We added an expiration date for the cookie which is 7 days from now and the maxAge.

// We have to configure our application to store our session information using mongo. The default storage 
// for express-session package is memory store as we have learnt that session data is saved on the server 
// side except for session cookie data which is stored on the browser. So, memory store cannot hold a 
// lot of information and production apps this is problematic. We use mongo to store session data. There 
// is a tool for this. We installed it npm i connect-mongo. We installed the latest version of connect-mongo
// so there are some syntax changes. We required connect-mongo in MongoStore and are storing our session 
// data in mongo local database for now. To do that, we are defining a new variable called store, the syntax
// of which comes from docs of connect-mongo and use the create method on MongoStore and pass arguments
// like mongourl: localMongoUrl and a secret: 'thisistemporary' and touchAfter. We dont want to resave the
// session everytime a user refresh the page. So we are saying that dont resave the session when the data
// hasn't changed everytime the user refreshes, but do it after 24 hours. We pass this store variable to
// our sessionConfig object. This will add a new collection called sessions in our local mongodb.

app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet({ contentSecurityPolicy: false, }));
app.use(helmet());
// Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, 
// but it can help! we installed npm i helmet and then required it app.js. app.use(helmet()) This will 
// enable all 11 of the middleware that helmet comes with. Instead of individually selecting the ones we 
// want. By passing app.use(helmet()) without any arguments, we are enabling all of them. But there is a p
// roblem with one middleware which is app.use(helmet.contentSecurityPolicy()); content security policy. 
// If we try to load the app after installing helmet and enabling all middleware including content security 
// policy, the images or scripts will not load and error message in inspect will say that it violates 
// content security policy directive. This middleware can be disabled by passing an argument 
// contentSecurityPolicy: false in app.use(helmet()).

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
    "https://cdn.jsdelivr.net"
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
                "https://res.cloudinary.com/dmmwxjdcj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// We required both passport and passport-local whcih is a strategy and then told our app to use
// passport.initialize() and passport.session() which are middleware and passport.session() is for 
// persistent login sessions. Otherwise a user has to login on very page because there wont be any
// statefulness. express-session which we have installed should be used before passport-session i.e
// app.use(session(sessionConfig)) should be used before app.use(passport.session()) whcih we are doing.

// passport.use(new LocalStrategy(User.authenticate())) is allowing us to say to passport to use the
// LocalStrategy which we have downloaded and required and for that LocalStrategy the authentication method
// is going to be located on our User model which is called .authenticate() which we havent defined but 
// is coming from passportlocalmongoose which is a static method. There are other static methods defined
// which can be looked on passpotlocalmongoose documentation.

// passport.serializeUser(User.serializeUser()) is telling passport to serialize user which basically
// means how do we store user in a session and passport.deserializeUser(User.deserializeUser()) tells
// passport on how to get user out of the session.

// const validateCampground = (req, res, next) => {
//     const campgroundSchema = Joi.object({
//         campground: Joi.object({
//             title: Joi.string().required(),
//             price: Joi.number().required().min(0),
//             image: Joi.string().required(),
//             location: Joi.string().required(),
//             description: Joi.string().required()
//         }).required()
//     })
//     const { error } = campgroundSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400);
//     } else {
//         next();
//     }

// }

// const validateCampground = (req, res, next) => {
//     const { error } = campgroundSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400);
//     } else {
//         next();
//     }
// }
// This is second iteration of the joi schema validation after the schema has been moved to a new file
// called schemas.js

// const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400);
//     } else {
//         next();
//     }
// }

app.use((req, res, next) => {
    // console.log(req.session);
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
// This is the middleware for flash.
// We are adding a property called currentUser to the 'locals' object  and equating it to req.user which
// is automatically generated when a user is successfully authenticated  by the method .isAuthenticated()
// which comes from passport and which is defined in the middleware isLoggedIn which we are using on
// certain routes to prevent users who are not logged in from submitting new campground or editing or
// deleting it or when a user logs in. req.user contains infromation like email, name, and the ._id of 
// the user. Now in our templates we'll have access to currentUser and we can use this to show either 
// login/register or logout depending on the currentUser in the navbar 

// EXAMPLE ON HOW PASSPORT WORKS

// app.get('/fakeuser', async (req, res) => {
//     const user = new User({ email: 'sattipandu@gmail.com', username: 'satti' });
//     const newUser = await User.register(user, 'pandu');
//     res.send(newUser);
// })
// In this example, we are making a new instance of our User model and hardcoding an email and a username
// but not the password. Instead we call the register method which comes with passportlocalmongoose which
// is a mongoose static method, which we havent defined, which is a convenience method to register a new 
// user instance with a given password and checks if username is unique. So User.register takes the entire
// instance of the User model which is defined in the variable user and the password and going to hash the
// password and store it in the database.


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home.ejs');
})

// app.get('/campgrounds', catchAsync(async (req, res, next) => {
//     const campgrounds = await Campground.find({});
//     res.render('campgrounds/index.ejs', { campgrounds });
// }))

// app.get('/campgrounds/new', (req, res) => {
//     res.render('campgrounds/new.ejs');
// })

// app.post('/campgrounds', catchAsync(async (req, res, next) => {
//     if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
//     const campground = new Campground(req.body.campground);
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);
// }))

// We are using req.body.campground instead of just req.body because we added arrays campground[title]
// and campground[location] in the 'name' attibute of the input element of the form in new.ejs file which
// is the body that is being parsed when the post request is made and is being converted to an object
// {"campground":{"title":"yellebey","location":"sittiga"}}. 

// We are throwing a new error if there is no req.body.campground which means that if any fields in the
// form are left empty, an error message is displayed. Even though we added client side form validations
// using bootstrap i.e if any field is left empty, bootstrap will not allow the from to be submitted, 
// people can use postman or hoppscotch to send a post request by filling the data in the headers. So we
// are throwing an error which will be caught by catchAsync function, which will hand it off to next(),
// which then triggers error handling middleware at the bottom of this file.

// app.post('/campgrounds', catchAsync(async (req, res, next) => {
//     const campgroundSchema = Joi.object({
//         campground: Joi.object({
//             title: Joi.string().required(),
//             price: Joi.number().required().min(0),
//             image: Joi.string().required(),
//             location: Joi.string().required(),
//             description: Joi.string().required()
//         }).required()
//     })
//     const { error } = campgroundSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400);
//     }
//     console.log(result);
//     const campground = new Campground(req.body.campground);
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);
// }))

// This is the second iteration of the post request after we installed Joi schema validator.
// When we are sending a post request, we are throwing an error if there is no body property in the request
// object to prevent users from sending data through postman or hoppscotch. But it'll not prevent users
// from just entering the title of the campground like 'araku camp' in the body section of the post request
// in postman and submitting it by leaving all the other information. The data will be saved in the server
// without location or an image or the price.(Note: entered campground[title] and 'araku camp' in the
// body section of the post request which is a urlencoded form). There is a tool called 'joi' which is
// a schema validator. We installed it 'npm i joi' and required it. This is different from mongoose schema
// validation in that it'll validate the data even before we save it with mongoose

// app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
//     const campground = new Campground(req.body.campground);
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);
// }))
// This is the third iteration of the post request after we created a separate middleware for joi and 
// added it as an argument.

// app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id).populate('reviews');
//     res.render('campgrounds/show.ejs', { campground });
// }))

// app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     res.render('campgrounds/edit.ejs', { campground });
// }))

// app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
//     res.redirect(`/campgrounds/${campground._id}`);
// }))

// app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     await Campground.findByIdAndDelete(id);
//     res.redirect('/campgrounds');
// }))

// app.get('/campground', async (req, res) => {
//     const camp = new Campground({ title: 'My Backyard', location: 'cheap camping' });
//     await camp.save();
//     res.send(camp);
// })

// app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     const review = new Review(req.body.review);
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);
// }))

// app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/campgrounds/${id}`);
// }))
// Not only are we supposed to delete the review but also the reference to this review i.e objectid in
// the reviews array in campgrounds object. We are using a mongodb operator called $pull. The $pull
// operator removes from an existing array all instances of a value or values that match a specified 
// condition. We are finding the campground based on the id and then using the $pull operator to pull from
// the reviews array the reviewId and then updating the campground.


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// app.use((err, req, res, next) => {
//     const { statusCode = 500, message = 'Something went wrong' } = err;
//     res.status(statusCode).send(message); This was before we rendered error.ejs
// })
// If we goto an invalid route like /eghtjnfjtj, it'll trigger app.all middleware where we added a new 
// error in the ExpressError class in the next function as an argument. Since we did not throw this error
// but as an argument in next(), it'll trigger the error handling middleware and the error object will be
// passed to it. We destructured statusCode and message from this error object and added default status
// and message and then responded with the status and message. AN invalid route or path returns a 404
// status and Page Not FOund message, while a mongoose cast or validation error will return a status of
// 500 which is the default status the we declared in the error handling middleware. We added error.ejs
// later after writing the notes above and rendered it

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something Went Wrong";
    res.status(statusCode).render('error.ejs', { err });
})
// This was after we added an error template i.e error.ejs

app.listen(3000, () => {
    console.log('LISTENING ON 3000');
})

// CLIENT SIDE VALIDATIONS

// When we make it mandatory for the user to enter data into a field in the form before submitting it, we
// pass in an attribute called 'required' in the input element in the form elemene in new.ejs or edit.ejs
// files. This is one way of valiating data on the client side. But to get more aesthetically looking
// warning that all the fields or some of them are required we can use bootstrap validation which is
// located under the forms category in bootstrap 5.

// Joi validation schema shouldbe written as a separate middleware instead of writing it in a single
// route handler since it is useful in multiple route handlers to validate like in put requests where
// we edit the form ans submit new data.

// PASSPORT NOTES

// Instead of using bcrypt to hash a password and storing data in the session, we are going to use a tool
// called passport which is an authentication middleware for node.js. Passport comes with multiple
// strategies like facebook login, google login, twitter login or local login which we are going to use.
// Passport is a popular tool for authentication, but for first time users who start learning about
// authentication with passport, all of it seems magical. So, we have learnt what hashing is, how data
// is stored in the session, how a hashed password is saved and how bcrypt is used for hashing. We have
// to install passport and then passport-local which is a strategy that we want which allows basic
// authentication and passport-local-mongoose which simplifies it further for people using mongoose db's
// which we use. If we are planning on expanding our app, we can install other strategies like google
// login by passport-google.

// MULTIPART/FORM-DATA

// A regular html form will not be able to send files to our server. So we have to change our form to be
// able to send files like images instead of image addresses. And the second issue is that we need to
// store images somewhere. We typically dont store them in mongo because images are large and there is a
// BSON size limit of 16MB. We can use a tool called cloudinary which is  a website that is used to store
// information like files or images on their database that we can retrieve and it as some features which
// allows us to compress or transform images and other files.

// We have to setup our form so that it can accept files and submit that form which will hit our server
// and then take those files that have been sent and store it in cloudinary which will send us back a
// url of those files and we'll save those url's in our mongo database.

// Every form we have done so far is a url encoded form. But to upload files we have to set the encoding
// type i.e. the enctype attribute of the form to be multipart/form-data. After submitting the data in
// the form for a new campground, it'll hit the post route and to save it in the mongo server which is
// inside the req.body object, we parse it and to parse it we use app.use(express.urlencoded({ extended:
// true })); So when we change the enctype attribute in the form from urlencoded to multipart/form-data
// and the user submits a file, req.body will return an empty object. So to parse multipart/form-data
// we have to use a middleware called Multer which is a popular one. To install npm i multer. Multer adds
// a body object and a file or files object to the request object. The body object contains the values of
// the text fields of the form, the file or files object contains the files uploaded via the form.

// to run multer we have to require it (const multer  = require('multer')) and then we have to
// initialize it or execute the function (const upload = multer({ dest: 'uploads/' })) and pass a
// configuration object as an argument in the function.  The upload function will come with a bunch of
// methods called upload.single and upload.array and if used, multer will parse the file and store the
// file/files in req.file or req.files and any other information on req.body.

// CLOUDINARY

// After we register for cloudinary we'll get a name, an api key and api secret and an api environment
// variable. These are our credentials and if somebody has access to them, they can upload their images
// to our cloudinary account which then becomes expensive for us if we build an app with hundreds of users
// and deploy it. So, we shouldnt be directly embedding these credentials inside our application but store
// them in a file that we dont include while submitting to github as an example or share with other people.
// This file stays on our machine loaclly and is a dotenv i.e. .env file. To setup a .env file, we have to
// make the file in the top level of our application and in here we define key value pairs. The syntax is
// secret=donotnotopen. We put our cloudinary credentials in this file and to get access to this information
// inside the application we have to use a package called dotenv, npm i dotenv. After installing dotenv
// we add if (process.env.NODE_ENV !== "production") {
//               require('dotenv').config();
//             }
// process.env.NODE_ENV is an environment variable that is usually development and production and we have
// been running in development this whole time, but when we deploy we have to run our code in production
// Here, we are saying that if we are running the code in development mode, which we are, require the
// package dotenv which is going to take the variables we have defined in the .env file and add them into
// process.env in our node app and we can access them in any of our files. In production we dont do this
// but there is another way of setting environment variables where we dont store them in .env file.
// The enviroment variable in this example is process.env.SECRET. We printed it at the top. If we upload
// this code somewhere like github, we'll not include the file .env but other people will see that there
// is an environment variable or if its in production our enviroment will have the value setup. We have
// copied and pasted our cloudinary name, key and secret and we'll have access to them in
// process.env.CLOUDINARY_NAME etc.

// To store tha images uploaded from the client side in cloudinary after setting it up, we can use a tool
// called multer storage cloudinary that works with multer. Once we get the urls from cloudinary, multer
// adds those in so that we have access to them in our route handlers. We first have to install cloudinary
// and then multer storage cloudinary i.e. npm i cloudinary multer-storage-cloudinary. We required cloudinary
// and multer-storage=cloudinary in index.js in cloudinary folder and exported it.


// MAPBOX

// The mapping library happens via javascript on the client side in the browser. So we have to provide our
// access token to mapbox via javascript in the browser. So the access token that we get after registering
// with mapbox will be visible in the javascript if we look in our developer tools. So, we don't hide the
// token. The public token from our mapbox account has to be copied to the .env file that we created in
// our yelpcamp application when we registered for cloudinary.

// when  a user  is creating a new campground and specifies a location, we are going to take that location
// like vizag and attempt to get latitude and longitude coordinates for that. The way we can achieve this
// is by using mapbox's geocoding api. There are lots of tools to geocode and there are standalone api's
// just for geocoding like google has one, but we'll use mapbox client. We can make a manual request our
// self with geocoding.  Geocoding documentation in mapbox states that there is forward geocoding where
// it converts location text into geographic coordinates, turning 2 Lincoln Memorial Circle NW into -77.050,38.889.
// and reverse geocoding where it turns geographic coordinates into place names, turning -77.050, 38.889 into 2 Lincoln Memorial Circle NW.

// Instead of making requests manually using mapbox api endpoints, we are going to use a mapbox node
// client. To install mapbox      npm install @mapbox/mapbox-sdk