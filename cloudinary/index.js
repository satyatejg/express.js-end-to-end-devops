const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});
// This associates our account with the cloudinary instance.

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Yelpcamp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    },
});
// We are instantiating an instance of CloudinaryStorage and passing cloudinary object that we configured
// to associate our account and then we can specify or pass in 'folder' which is the folder in cloudinary
// that we store files in.

module.exports = {
    cloudinary,
    storage
}
// After exporting, we required storage in campgrounds route to change the destination to store images
// from folder to cloudinary.