const express = require('express');
const router = express.Router();
const Board = require('../models/board.js');
const Column = require('../models/column.js');
const Card = require('../models/card.js');
const ObjectId = require('mongodb').ObjectId;
router.get('/dashboard', async (req, res, next) => {
    const id = req.query.id;
    const boards = await Board.find({owner: ObjectId(id)}).populate(
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

router.get('/board/:id', async (req, res, next) => {
    const id = req.params.id;
    
    const board = await Board.findById(id).populate(
        {
            path: 'column',
            populate: {
                path: 'cards',
                model: 'card'
            }
        }
    );
    res.json(board);
});

router.post('/editBoardName', async (req, res, next) =>{
    const id = req.body.id;
    const newName = req.body.newName;

    await Board.findByIdAndUpdate({ _id: id }, { name: newName }, function(err, result) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.status(200).json({message: "success"});
          }
        }
      );
});

router.post('/editCard', async (req, res, next) =>{
    const id = req.body.id;
    const newContent = req.body.newContent;

    await Card.findByIdAndUpdate({ _id: id }, { content: newContent }, function(err, result) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.status(200).json({message: "success"});
          }
        }
      );
});

router.post('/save', async (req, res, next) =>{
    const id = req.body.idColumn;
    const newCard = new Card({
        content : req.body.content
    });
    await newCard.save(function(err, obj) {
        const idCard = obj._id;
        if (err)
            res.send(err);

        Column.updateOne(
            { _id: ObjectId(id) },
            { $push: { cards: [ObjectId(idCard)] } },
            function(err, result) {
              if (err) {
                res.send(err);
              }
            }
          );
        res.status(200).json({ message: 'Card created!', data: obj });
    });
});

router.post('/deleteCard', async (req, res, next) =>{
    const idCol = req.body.idColumn;
    const idCard = req.body.idCard;
    await Column.updateOne(
        { _id: ObjectId(idCol) },
        { $pull: { cards: [ObjectId(idCard)] } },
        function(err, result) {
          if (err) {
            res.send(err);
          }
        }
      );
    await Card.deleteOne({_id: ObjectId(idCard)}, function(err) {
        if (err)
            res.send(err);
        res.status(200).json({ message: 'Card deletes successfully!'});
    });
});

module.exports = router;