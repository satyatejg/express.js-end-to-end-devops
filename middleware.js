const { campgroundSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const { reviewSchema } = require('./schemas.js');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    // console.log('REQ.USER:', req.user);
    if (!req.isAuthenticated()) {
        // console.log(req.path, req.originalUrl);
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Em ekasekkaluga undheti, login avvu vedhava!!');
        return res.redirect('/login')
    }
    next();
}

// when we use .isAuthenticated method which comes from passport to authenticate the user, a property 
// called 'user' is added to the request object which contains the information of the user. We are using
// this middleware only on certain routes like new campground to check whether the user is logged in to
// create a new campground. If the user is authenticated when accessing this route, then req.user will be
// filled with user information which is coming from the session. We added req.user to res.locals which 
// we have access to in every template in app.js file. res.locals.currentUser = req.user

// When a guest tries to create a new campground, he'll be redirected to login page to first login and after
// he logs in, instead of being taken to the new campground page, he'll be redirected to all campgrounds
// page because we have written the code res.redirect('/campgrounds) in the /login route and in the same
// way when a guest tries to edit a page as the edit button is visible even to the guest currently as of
// writing this paragraph, he'll be redirected to the login page and after logging in to the campgrounds
// page, but not to the page or campground he want to edit.

// The path and originalUrl are added to the request object and when a guest tries to create a new 
// campground 'isLoggedIn' code is triggered and the path which is /new and the originalUrl which is
// the complete path i.e. /campgorunds/new will be printed because isLogggeIn middleware was triggered
// from that new campground path. If a guest tries to edit a campground he'll be redirected to the login
// page because isLoggedIn is triggered again and this time the path will be /:id/edit and the complete
// path or oiginaUrl will be /campgrounds/:id/edit since the guest triggered this middleware when trying
// to edit campground with logging in.

// So we store the originalUrl on the session by adding a new property that we defined called returnTo and
// equating it to req.originalUrl which is the url that we want the user to redirect back to. We'll see
// the returnTo property added to the session object when this middleware is triggered i.e. when a guest
// tries to create a new campground or tries to edit a new campground. 

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
// this is the middleware to check whether a user is authorized to either edit or delete a campground.

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}