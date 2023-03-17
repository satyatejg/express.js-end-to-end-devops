const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
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

// const seedDB = async () => {
//     await Campground.deleteMany({});
//     const c = new Campground({ title: 'purple field' });
//     await c.save();
// }

// seedDB(); This was to check whether the database was connected and data being added

// To pick a random element from an array an easy way of doing it is by picking a random number and multiplying
// it with the length of the array and floor it and access it out of the array
// array[Math.floor(Math.random() * array.length)]

const sample = array => array[Math.floor(Math.random() * array.length)];
// The above function is the same as the one below 
// const sample = function (array) {
//     return array[Math.floor(Math.random() * array.length)];
// }

// We are saving the code to pick a random element from an array to a function and declaring it in a
// variable called sample. Then we are passing the arrays places and descriptors that we required as
// arguments in the sample function.

const seedDB = async () => {
    await Campground.deleteMany({});
    for (i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 1400) + 100;
        const camp = new Campground({
            author: '640b29c5ecc693ea648293e5',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rem dignissimos recusandae esse. Vero fuga voluptatibus similique labore nostrum accusantium cum illum est! Ab tenetur itaque sequi ea voluptatibus voluptates mollitia.',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dmmwxjdcj/image/upload/v1678520774/Yelpcamp/gxhti6sdapmwxh2xj9pp.jpg',
                    filename: 'Yelpcamp/gxhti6sdapmwxh2xj9pp',
                },
                {
                    url: 'https://res.cloudinary.com/dmmwxjdcj/image/upload/v1678520797/Yelpcamp/v8v70fpg41fgsjyfwaso.jpg',
                    filename: 'Yelpcamp/v8v70fpg41fgsjyfwaso',
                },
                {
                    url: 'https://res.cloudinary.com/dmmwxjdcj/image/upload/v1678520809/Yelpcamp/jykeu0l5h895gzyehax7.jpg',
                    filename: 'Yelpcamp/jykeu0l5h895gzyehax7',
                }
            ]
        })
        // console.log(camp);
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})

// We have updated all the campgrounds in our database after adding the user reference in the campground
// model and adding it here.

