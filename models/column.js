const mongoose = require('mongoose');

const Column = mongoose.Schema(
    {
        name: String,
        cards: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'card', default: []
        }]
    }
);
module.exports = mongoose.model('column', Column, 'column');