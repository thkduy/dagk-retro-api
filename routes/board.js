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

router.post('/createBoard', async (req,res,next) => {
  const name = req.body.name;
  const des = "description " + name;
  const idUser = req.body.idUser;

  const col1 = new Column({
    name:"Went Well"
  });
  
  const col2 = new Column({
    name:"To Improve"
  });
  const col3 = new Column({
    name:"Action Items"
  });
  await col1.save(function(err, col) {
    if (err)
      res.send(err);
    else{
      col1.id = col._id;
    }
  });
  await col2.save(function(err, col) {
    if (err)
      res.send(err);
    else{
      col2.id = col._id;
    }
  });
  await col3.save(function(err, col) {
    if (err)
      res.send(err);
    else{
      col3.id = col._id;
    }
  });
  const newBoard = new Board({
    name: name,
    description: des,
    owner: ObjectId(idUser),
    column:[col1.id,col2.id,col3.id]
  })
  newBoard.save( async function(err, newBoard) {
    if (err)
      res.send(err);
    else{
      const boardData = await Board.findById(newBoard._id).populate(
        {
            path: 'column',
            populate: {
                path: 'cards',
                model: 'card'
            }
        }
    );
      res.status(200).json({ message: 'Board created!', newBoard: boardData });
    }    
  });
})

router.post('/deleteBoard',async (req,res,next) => {
  const idBoard = req.body.id;

  const board = await Board.findById(idBoard).populate(
    {
        path: 'column',
        populate: {
            path: 'cards',
            model: 'card'
        }
    }
  );
  //console.log("board id: "+board._id);

  await Board.deleteOne( {"_id": board._id});

  const columns = board.column;

  columns.map( async (col)=>{
    //console.log("col id: " + col._id);
    const cards = col.cards;
    await Column.deleteOne( {"_id": col._id});
    cards.map( async (card) => {
      //console.log("card id: " + card._id);
      await Card.deleteOne( {"_id": card._id});
    })

  })

  res.status(200).send(board._id);

  // Board.findOneAndDelete({_id: ObjectId(idBoard)}, async (error, board) =>{
  //   if(error)
  //     res.status(400).send(error);
  //   else{
  //     const column = board
  //   }
  // })
})

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
    console.log(id);
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