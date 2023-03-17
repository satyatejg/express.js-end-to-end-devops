const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

// router.get('/register', (req, res) => {
//     res.render('users/register.ejs');
// })

// router.get('/register', users.renderRegister);
// This is the second iteration after we moved the logic to the users.js file in the controller 
// directory and required it here

// router.post('/register', catchAsync(async (req, res, next) => {
//     try {
//         const { email, username, password } = req.body;
//         const user = new User({ email, username });
//         const registeredUser = await User.register(user, password);
//         req.login(registeredUser, err => {
//             if (err) {
//                 return next(err);
//             }
//             req.flash('success', 'Welcome to Yelp Camp');
//             res.redirect('/campgrounds');
//         })

//     } catch (e) {
//         req.flash('error', e.message);
//         res.redirect('/register');
//     }
// }));

// If somebody tries to register with an already existing username, it results in an error and catchAsync
// will catch that error and passes it onto next() which will then trigger the error handling middleware
// written at the end of app.js file. We want the user to be redirected to the register page if an error
// occurs, so we used try and catch and if an error occurs, the error object which has been caught contains
// a property 'message' which we are flashing with the keyword 'error' and redirecting to /register.

// After the user registers successfully, they will be redirected to /campgrounds, but if they try to create
// a new campground after just registering, they'll be taken to the login page. So a newly registered user 
// will not be automatically logged in to create a new campground, but they have to log in after registering
// to create a new campground. This is slightly annoying. So, there is a helper method called .login()
// which comes from passport which can be used to establish a login session. This is usually invoked when
// users sign up and can be used to automatically login the registered user. So, we have added req.login
// and passed the registeredUser as an argument and it requires a callback, so we pass in err parameter
// in the callback function and if there is an error, we return next(err), which will trigger error
// handling middleware.

// router.post('/register', catchAsync(users.register));
// This is the second iteration after we moved the logic to the users.js file in the controller 
// directory and required it here

// router.get('/login', (req, res) => {
//     res.render('users/login.ejs');
// })

// router.get('/login', users.renderLogin);
// This is the second iteration after we moved the logic to the users.js file in the controller 
// directory and required it here

// router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), (req, res) => {
//     // console.log(req.user);
//     req.flash('success', 'Welcome Back');
//     const redirectUrl = req.session.returnTo || '/campgrounds';
//     delete req.session.returnTo;
//     res.redirect(redirectUrl);
// })

// Instead of using bcrypt where we used the method .compare to compare the password entered by the user
// to login and the hashed password of the user saved in the database to authenticate, we use passport 
// and the middleware that comes with this tool called passport.authenticate(). This middleware expects
// us to specify the strategy which is local in our case as an argument and as a second argument we have
// a bunch of options to specify as an object and one of them is {failureFlash: true} which flashes a
// message for us automatically and {failureRedirect: '/login'} which redirects to login if things go
// wrong.

// To remember the user who is logged in and to prevent them from accessing certain routes, we used the
// user._id of the user and stored it in the session object as a property when we used bcrypt tool. But
// passport comes with a helper method .isAutheticated and is automatically added to the request object

// We are saving req.session.returnTo which consists of the originalUrl when .isAuthenticated middleware
// is triggered and /campgrounds to a variable redirectUrl and passing it as an argument in res.redirect
// because we want a guest to be redirected to the edit page that he is trying to edit after he logs in
// and not to /campgrounds and if the guest is trying to create a new campground, he should be redirected
// to the /campgrounds/new page after logging in and not /campgrounds. Goto the middleware.js file for
// more notes.

// router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.login);
// This is the second iteration after we moved the logic to the users.js file in the controller 
// directory and required it here


// router.get('/logout', (req, res, next) => {
//     req.logout(function (err) {
//         if (err) {
//             return next(err);
//         }
//         req.flash('success', 'Dhanyavaadaalu');
//         res.redirect('/campgrounds')
//     });
// })

// To logout a user we can use a helper method which comes with passport which is automatically added to the
// request object called .logout(). In the new version of passport we have to add a callback function 
// as an argument in the logout() method which hasnt been covered in the lecture, but we got the answer
// from the q&a under the lecture. We also have to add the logout button and we did in the navbar.

router.get('/logout', users.logout);
// This is the second iteration after we moved the logic to the users.js file in the controller 
// directory and required it here

// router.route()

// Returns an instance of a single route which you can then use to handle HTTP verbs with optional 
// middleware. Use router.route() to avoid duplicate route naming and thus typing errors.

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), users.login)

module.exports = router;
