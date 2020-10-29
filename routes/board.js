const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const Column = require('../models/column');
const Card = require('../models/card');
router.get('/', async (req, res, next) => {
    const boards = await Board.find().populate(
      {
          path: 'column',
          populate: {
              path: 'cards',
              model: 'card'
          }
      }
    ).lean();
    res.json(boards);
});

module.exports = router;