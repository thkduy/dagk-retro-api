const Mongoose = require('mongoose');

const User = Mongoose.Schema(
    {
        username: {type: String, trim: true},
        password: {type: String, trim: true, select: false},
        name: String,
        email: String
    }
);

module.exports = Mongoose.model('user', User, 'UserData');