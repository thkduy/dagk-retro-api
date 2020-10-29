const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');



const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://adminretro:admin@cluster0.4kg2c.mongodb.net/retro?retryWrites=true&w=majority', 
{ useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).
then(
    () => {
        console.log('database connect successfully')
 
    },
    err => { /** handle initial connection error */
        console.log(err);
    }
);
mongoose.set('useFindAndModify',false);
const boardRouter = require('./routes/board');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use('/', boardRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
