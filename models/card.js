const mongoose = require('mongoose');

const Card = mongoose.Schema(
    {
        content: String,
    }
);
module.exports = mongoose.model('card', Card, 'card');