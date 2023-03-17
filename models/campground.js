const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
})


module.exports = mongoose.model('Campground', CampgroundSchema);

// We have added the author property which refers to the user for authorization.
// After registering for cloudinary we have changed image from a string to an array because we want multiple
// images and for each image we want to store the url i.e. the cloudinary url and the filename.

// https://res.cloudinary.com/dmmwxjdcj/image/upload/w_300/v1677754316/Yelpcamp/fy04nwedtj0opfkt4atc.jpg
// We can add virtual property to our schema to reduce or modify the images we are requesting from cloudinary
// We are removing the images property in the CampgroundSchema and defining it separately and saving it in
// in ImageSchema. We can nest schemas and thats what we are doing here to add virtual property to request
// modified images which are reduced in size from cloudinary. We are using the .virtual method on our
// ImageSchema and 'this' in the function refers to the particular image. So we'll have access to this.url
// or this.filename. On this.url we are using the replace method i.e. this.url.replace amd replacing
// /upload with /upload/w_200 which will reduce the size of the image coming from cloudinary.

// We talked about virtuals in mongoose when we printing the fullname after only describing only the first
// and last names in the schema buth then using the virtual method on this schema like the example below
// const userSchema = mongoose.Schema({
//   firstName: String,
//   lastName: String
// });
// // Create a virtual property `fullName` with a getter and setter.
// userSchema.virtual('fullName').
//   get(function() { return `${this.firstName} ${this.lastName}`; }).

// We are only storing the url of the cloudinary image in our database and using the virtual method from
// mongoose to reduce the size of the image when made a request. The virtual doesnt store this reduced
// size image in the database. Now the property in our show or edit pages where we are displaying images
// has to be changed from .url to .thumbnail i.e. img.url to img.thumbnail.

// geometry schema has been copied from https://mongoosejs.com/docs/geojson.html

// Just like we created a virtual property called .thumbnail to reduce the size of images in edit page,
// we are creating another virtual property called 'properties' to be accessible in the clustermap.js
// file, since we need a property called 'properties' as it is the template or format that mapbox follows.
// mapbox looks for geometry which consists of the type and coordinates and properties in the object
// which is campgrounds in our case to display information on popups i.e. the thing that displays data
// when a campground is clicked. Mapbox looks for 'properties' in the object to display this data on
// clicking the campground circle and since we do not have a property named 'properties' in our schema,
// we are creating one using virtual and putting 'popUpMarkup' property in that virtual.

// Since mongoose doesn't include virtuals when a document is converted to json, we need to set toJSON:
// schema option to { virtuals: true }. and pass it into our schema