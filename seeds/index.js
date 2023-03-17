const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const dbUrl = process.env.DB_URL;

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


const sample = array => array[Math.floor(Math.random() * array.length)];


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

        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})



