// The term controller comes from MVC which is a pattern which stands for Model, View and Controller 
// which is an approach to structuring applications. We are already using the models and views directories 
// where we define our models and ejs files, layouts and partials. Controller is where all the main logic 
// happens where we render our views and work with models.
const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs');
}

module.exports.createCampground = async (req, res, next) => {
    // const geoData = await geocoder.forwardGeocode({
    //     query: 'Yosemite', CA,
    //     limit: 1
    // }).send();
    // console.log(geoData.body.features.geomerty.coordinates);

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}
// After adding 'upload.array('image')' as a third argument in our post route, we now have access to files
// property on our req object which consists of the cloudinary url in the key 'path' and the filename 
// thanks to the program that we installed multer and multer-storage-cloudinary. We are looping over 
// those files and for each one of them, we are taking the path and the filename and adding them to campground

// We required mapbox after installing it and we passed in our public access token. After we instantiate a new 
// new mapbox geocoding instance i.e. mbxGeocoding({accessToken: mapBoxToken}); we passed in our access 
// token. The key comes from mapbox. We save this instance in the variable geocoder and this consists
// of our two methods i.e. forward and reverse geocoding. We are just going to use forward geocoding. Goto
// the documentation https://github.com/mapbox/mapbox-sdk-js/blob/main/docs/services.md#geocoding for more
// information about geocoding and the syntax. This geocoder object is saved to the variable geodata and
// after printing this object, we'll need the property 'body' in this object. This 'body' property is an
// object which consists of a property called 'features'. Inside of features we have geometry and inside
// that, we have coordinates of the place that we hardcoded in the forwardGeocode method under the key
// 'query'in our example which is 'Yosemite, CA'. Now to get the coordinates of the location of the user
// who creates a new campground, we can pass in req.body.campground.location as the value of the 'query'
// key

// We have to store these coordinates of the location in our database. Instead of creating another field
// in our campgrounds model like lat: Number and long: Number and storing the geocode coordinates and 
// retrieve them to render on a map, we are going to use geoJSON. When we print geoData.body.features[0].geometry
// we get a geoJSON which is a format for encoding a variety of geographical datastructures. Mongo supports
// geoJSON and mongoose has a format for schema of geoJson files https://mongoosejs.com/docs/geojson.html
// mongodb also supports geojson https://www.mongodb.com/docs/v6.0/geospatial-queries/. So this is why we
// are following this pattern of saving the coordinates in an array and the type property so that we can
// use the operators that come with mongodb later on.

// We are generating a geojson by using the value req.body.campground.location which is the location
// entered by the user in the key 'query' in the forwardGeocode method and saving it to geoData variable
// This geoData variable consists of the geojson in geoData.body.features[0].geometry which we are then
// inserting into campground.geometry.



module.exports.showCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    })
        .populate('author');
    // console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', { campground });
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', { campground });
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(campground)
    }
    req.flash('success', 'Successfully updated the campground');
    res.redirect(`/campgrounds/${campground._id}`);
}
// If the user wants to upload additional images we have to use the push array method to prevent overriding
// existing images in campground.images and then saving campground. We are saving the  req.files object to
// the variable imgs and which becomes an array and then spreading it in the push argument using the spread
// operator.

// After adding the img element and input type checkbox to display images and checkboxes and associating
// them by using campground.images and looping over it using forEach method in the edit.ejs page in 
// campgrounds, and passing in the name=deleteImages[] attibute in the input type checkbox element, we'll
// have access to images in an array in req.body.deleteimages that have filenames we want to delete.

// We are saying that if there is deleteImages property in req.body then pull from the images array, all
// images where the filename of the image is in req.body.deleteImages and then update the campground. We 
// are basically deleting the image file by using the pull operator of mongodb. This only deletes image
// files form mongodb and not from cloudinary. A method taht comes with cloudinary can be used to delete
// images from cloudinary. So, we required cloudinary object in this file form the cloudinary directory.
// We loop over the images by ' for(let filename of req.body.deleteiamges)' and then use the destroy 
// method on uploader and pass in filename.

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}