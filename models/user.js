const Mongoose = require('mongoose');

const User = Mongoose.Schema(
    {
        username: {
            type: String, 
            require: true,
            unique: true,
        },
        password: {
            type: String,
        },
        name: String,
        email:{
            type: String,
            require: true,
            unique: true,
        }, 
    }
);

module.exports = Mongoose.model('user', User, 'user');