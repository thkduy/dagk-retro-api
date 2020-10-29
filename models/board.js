const mongoose = require('mongoose');

const Board = mongoose.Schema(
    {
        name: String,
        description: String,
        owner: {type: mongoose.Schema.Types.ObjectId, ref: 'UserData'},
        column: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'column'
        }]
    }
);
module.exports = mongoose.model('board', Board, 'board');