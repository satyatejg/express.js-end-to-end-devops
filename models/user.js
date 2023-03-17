const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);


// Instead of defining username and password in the UserSchema, we are passing in passportLocalMongoose
// as an argument in the .plugin method of UserSchema which will add on to our UserSchema a field for
// username and password and make sure the usernames are unique and also gives us additional methods.


