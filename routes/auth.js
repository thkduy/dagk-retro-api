const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const passport = require("passport");
const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const user = require("../models/user.js");
const User = require("../models/user.js");

const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'mysecretword';

const strategy = new JwtStrategy(jwtOptions, async function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
  const user = await User.find({_id: jwt_payload.id});
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);

const app = express();
app.use(passport.initialize());

// parse application/x-www-form-urlencoded
// for easier testing with Postman or plain HTML forms
app.use(bodyParser.urlencoded({
  extended: true
}));

// parse application/json
app.use(bodyParser.json())



router.post("/login", async function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const user = await User.findOne({username : username});

  if( ! user ){
    res.status(401).json({message:"no such user found"});
    return;
  }

  const rs = bcrypt.compareSync(password, user.password);
  if(rs) {
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    let payload = {
      'id' : user._id,
      'name': user.name,
      'email': user.email,
    };
    const token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.status(200).json({message: "ok", token: token});
  } 
  else {
    res.status(401).json({message:"invalid username or password "});
  }
});

router.post("/signup", async function(req, res) {
  const { username, password, name, email } = req.body;

  const checkUsername = await User.findOne({username : username});

  if( checkUsername ){
      res.status(401).json({message:"Your username exists!"});
      return;
  }
  
  const checkUserEmail = await User.findOne({email : email});

  if( checkUserEmail ){
      res.status(401).json({message:"Your email exists!"});
      return;
  }

  const N = 10;
  const hash = bcrypt.hashSync(password, N);

  const newUser = new User({
      username: username,
      password: hash,
      name: name,
      email: email
  });

  await newUser.save(function(err, obj) {
      if (err)
          res.send(err);
      res.status(200).json({ message: 'Success'});
  })
});

router.post("/edit", async function(req, res){
  const {id, name, email} = req.body;

  const checkUserEmail = await user.findOne({email : email});
  if( checkUserEmail  && JSON.stringify(checkUserEmail._id).localeCompare(JSON.stringify(id)) === 0 ){
    res.status(401).json({message:"Your new email exists!"});
    return;
  }

  await user.findByIdAndUpdate({ _id: id }, { name: name, email: email }, function(err, result) {
    if (err) {
      res.status(400).send(err);
    } else {
      let payload = {
        'id' : result._id,
        'name': result.name,
        'email': result.email,
      };
      const token = jwt.sign(payload, jwtOptions.secretOrKey);
      res.status(200).json({message: "success", token: token});
    }
  }
);

})
module.exports = router;