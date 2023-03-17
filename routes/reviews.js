const express = require('express');
const router = express.Router({ mergeParams: true });
// We have to add this argument {mergeParamas: true} To have access to the id's which are params.

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Campground = require('../models/campground');
const Review = require('../models/review');

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');


// router.post('/', validateReview, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     const review = new Review(req.body.review);
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     req.flash('success', 'Created a new review');
//     res.redirect(`/campgrounds/${campground._id}`);
// }))
// This is the first iteration

// router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     const review = new Review(req.body.review);
//     review.author = req.user._id;
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     req.flash('success', 'Created a new review');
//     res.redirect(`/campgrounds/${campground._id}`);
// }))
// isLoggedIn middleware is used to prevent somebody from sending a post request to /campgrounds/:id/reviews
// using postman to see the review form without logging in. We already prevented guests from seeing the
// review submission form without logging in by using the 'if' conditional in campgrounds show.ejs page.
// After we added the author property in our review model to associate a particular logged in user to the
// review, we equated review.author to req.user._id

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));
// This is the second iteration after we moved the logic to the reviews.js file in the controller 
// directory and required it here



// router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     req.flash('success', 'Successfully deleted the review');
//     res.redirect(`/campgrounds/${id}`);
// }))
// Just like we created a middleware to prevent unauthorizes users from either editing or deleting a 
// campground which is isAuthor, we created another middleware called isReviewAuthor which follows the
// same logic as the campground middleware to prevent an unauthorized user from deleting a review.

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));
// This is the second iteration after we moved the logic to the reviews.js file in the controller 
// directory and required it here


module.exports = router;