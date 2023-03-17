const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage });
// We changed the place to store files from uploads folder to the storage variable whcih we defined in 
// index.js file in cloudinary folder which consists our credentials of cloudinary account and other
// properties like folder name in cloudinary etc.


// router.get('/', catchAsync(async (req, res, next) => {
//     const campgrounds = await Campground.find({});
//     res.render('campgrounds/index.ejs', { campgrounds });
// }))

// router.get('/', catchAsync(campgrounds.index));
// This is the second iteration after we moved the logic to the campgrounds.js file in the controller 
// directory and required it here


// router.get('/new', (req, res) => {
//     if (!req.isAuthenticated()) {
//         req.flash('error', 'You must be logged in');
//         return res.redirect('/login')
//     }
//     res.render('campgrounds/new.ejs');
// })
// To remember the user who is logged in and to prevent them from accessing certain routes, we used the
// user._id of the user and stored it in the session object as a property when we used bcrypt tool. But
// passport comes with a helper method .isAutheticated and is automatically added to the request object.
// This method only protects the form from somebody who wasnt signed in from submitting new campground.
// But people can still submit a new campground without loggin in using postman or hoppscotch by entering
// the name, price, location of the campground in the body section of postman.


// router.get('/new', isLoggedIn, (req, res) => {
//     res.render('campgrounds/new.ejs');
// })
// This is the second iteration of the /new route which renders us a form to submit a new campground after
// we moved the logic that ensures the user is logged in before submitiing a new campground to a middleware
// that we defined named isLoggedIn

router.get('/new', isLoggedIn, campgrounds.renderNewForm)
// This is the third iteration after we moved the logic to the campgrounds.js file in the controller 
// directory and required it here



// router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
//     const campground = new Campground(req.body.campground);
//     campground.author = req.user._id;
//     await campground.save();
//     req.flash('success', 'Successfully made a new campground');
//     res.redirect(`/campgrounds/${campground._id}`);
// }))
// We are associating the campground that is being created with the currently logged in user. We are 
// verifying that somebody is logged in using the 'isLoggedIn' middleware which was created using passport
// tool which creates a req.user property when a user logs in. In our templates we have access to locals 
// variable called currentUser which was equated to req.user. So we are taking that user id and saving 
// it as the author on this newly created campground. campground.author is an id in our schema before we 
// populate it.

// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
// This is the second iteration after we moved the logic to the campgrounds.js file in the controller 
// directory and required it here


// router.get('/:id', catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id).populate({
//         path: 'reviews',
//         populate: {
//             path: 'author'
//         }
//     })
//         .populate('author');
//     // console.log(campground);
//     if (!campground) {
//         req.flash('error', 'Cannot find the campground');
//         return res.redirect('/campgrounds');
//     }
//     res.render('campgrounds/show.ejs', { campground });
// }))
// Along with populating reviews, to also populate the author of the review after adding this property
// to the review model we write populate({path: reviews, populate: {path: author}}) which is a nested 
// populate. We can now display the name of the user who wrote the review in our campgrounds show.ejs 
// page by review.author.username since we have access to campground.reviews in our template which is
// being looped.

// router.get('/:id', catchAsync(campgrounds.showCampground));
// This is the second iteration after we moved the logic to the campgrounds.js file in the controller 
// directory and required it here


// router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     if (!campground) {
//         req.flash('error', 'Cannot find the campground');
//         return res.redirect('/campgrounds');
//     }
//     res.render('campgrounds/edit.ejs', { campground });
// }))
// This is the first iteration of edit route before we added the logic to check whether a user is authorized
// to edit campground

// router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     if (!campground) {
//         req.flash('error', 'Cannot find the campground');
//         return res.redirect('/campgrounds');
//     }
//     if (!campground.author.equals(req.user._id)) {
//         req.flash('error', 'You do not have permission to do that');
//         return res.redirect(`/campgrounds/${id}`);
//     }
//     res.render('campgrounds/edit.ejs', { campground });
// }))

// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     if (!campground) {
//         req.flash('error', 'Cannot find the campground');
//         return res.redirect('/campgrounds');
//     }
//     res.render('campgrounds/edit.ejs', { campground });
// }))
// This is the third iteration after we added the isAuthor middleware

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
// This is the fourth iteration after we moved the logic to the campgrounds.js file in the controller 
// directory and required it here


// router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
//     req.flash('success', 'Successfully updated the campground');
//     res.redirect(`/campgrounds/${campground._id}`);
// }))
// This is the first iteration of edit route before we added the logic to check whether a user is authorized
// to edit campground


// router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     if (!campground.author.equals(req.user._id)) {
//         req.flash('error', 'You do not have permission to do that');
//         return res.redirect(`/campgrounds/${id}`);
//     }
//     const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
//     req.flash('success', 'Successfully updated the campground');
//     res.redirect(`/campgrounds/${camp._id}`);
// }))
// This is the second iteration after we added the logic to check if the user who is trying to edit the
// campground is authorized to do so. We broke the helper method findbyidandupdate logic into two parts
// to first see who the user is and then check if they have the authorization to make changes. We are
// saying in the conditional that if the id of the logged user is not equal to the id of campground.author
// we'll flash an error and redirect the user to campground.

// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
//     req.flash('success', 'Successfully updated the campground');
//     res.redirect(`/campgrounds/${campground._id}`);
// }))
// This is the third iteration after we added the isAuthor middleware

// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));
// This is the fourth iteration after we moved the logic to the campgrounds.js file in the controller 
// directory and required it here


// router.delete('/:id', isLoggedIn, catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     await Campground.findByIdAndDelete(id);
//     req.flash('success', 'Successfully deleted campground');
//     res.redirect('/campgrounds');
// }))
// This is the first iteration of delete route before we added the logic to check whether a user is authorized
// to delete campground

// router.delete('/:id', isLoggedIn, catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     if (!campground.author.equals(req.user._id)) {
//         req.flash('error', 'You do not have permission to do that');
//         return res.redirect(`/campgrounds/${id}`);
//     }
//     await Campground.findByIdAndDelete(id);
//     req.flash('success', 'Successfully deleted campground');
//     res.redirect('/campgrounds');
// }))
// We used the same logic as in the edit route to check for the authorization of a user before deleting
// the page. This is the second iteration of the this route

// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     await Campground.findByIdAndDelete(id);
//     req.flash('success', 'Successfully deleted campground');
//     res.redirect('/campgrounds');
// }))
// This is the third iteration of this route after we moved the logic to check whether the user is
// authorized to delete the campground to a variable isAuthor

// We have duplicated the code to check whether a user is authorized to either edit or delete the campground
// in three routes. SO we could just move this code into a middleware and use that as argument in the
// three routes.

// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
// This is the fourth iteration after we moved the logic to the campgrounds.js file in the controller 
// directory and required it here

// router.route()

// Returns an instance of a single route which you can then use to handle HTTP verbs with optional 
// middleware. Use router.route() to avoid duplicate route naming and thus typing errors.

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
// .post(upload.array('image'), (req, res) => {
//     console.log(req.body, req.files);
//     res.send('IT WORKED');
// })
// We are grouping route handlers having the same path in this case '/' together using .route() which
// comes from express. 
// We used .post(upload.single('image'), (req, res) when learning about multer. The 'image' argument in
// the upload.single method is the 'name' attribute in the input element of the form element in the 
// new.ejs file in campgrounds. The file object will be added to req when we use the multer method like
// .single or .array which consists the image file or any other file. When the user sends a post request
// after submitting the form and uploading the image, it'll automatically create an uploads folder and
// in which the image file will be saved since we passed in the argument dest: 'uploads/' in
// const upload = multer({ dest: 'uploads/' }). But we are going to use cloudinary to save these files.
// To upload multiple images we a to set the attribute 'multiple' in our input element in the form and
// use the multer method upload.array('image'), and the object will be req.files

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;
