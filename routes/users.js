var express = require('express');
var createError = require('http-errors');
var router = express.Router();
var Mongo = require('../bin/mongo');
var uniqid = require('uniqid');
var crypto = require('crypto');


/* Log in */
router.put('/', function (req, res, next) {

  Mongo.getInstance()
    .collection('users')
    .findOne({
      email: req.body.email
    },
      function (err, response) {
        if (err) {
          return res.json({
            status: false,
            message: err.message
          });
        } else {
          if (!response || !response._id ||
            crypto.createHash('sha256').update(req.body.password + response.salt).digest('hex') !== response.password) {
            return res.json({
              status: false,
              message: 'Merci de vérifier vos identifiants',
            })
          }
          req.session.user = response

          return res.json({
            status: true
          });
        }
      });
});


/* Sign in */
router.post("/", function (req, res, next) {
  
  var errors = [];

  if (!req.body.pseudo || !/^([\w\s]{6,})$/.test(req.body.pseudo)) {
    errors.push("Pseudo");
  }

  if (
    !req.body.email ||
    !/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(
      req.body.email
    )
  ) {
    errors.push("Email");
  }

  if (!req.body.password2 || req.body.password !== req.body.password2) {
    errors.push("Confirmation du mot de passe");
  }

  if (errors.length) {
    return res.json({
      status: false,
      msg: "Merci de vérifier les champs suivants: " + errors.join(", "),
    });
  }

  let salt = uniqid();
  let password = crypto
    .createHash("sha256")
    .update(req.body.password + salt)
    .digest("hex");

  let datas = {
    pseudo: req.body.pseudo,
    avatar: req.body.avatar,
    email: req.body.email,
    password: password,
    salt: salt,
  };

  Mongo.getInstance()
    .collection("users")
    .insertOne(datas, function (err, result) {
      if (err) {
        if (err.message.indexOf("duplicate key") !== -1) {
          return res.json({
            status: false,
            message: "Cette adresse email est déjà utilisée",
          });
        } else {
          return res.json({
            status: true,
          });
        }
      }
    });
});

router.use(function (req, res, next) {
  if (!req.session.user) {
    return next(createError(403))
  }
  return next();
})

router.get('/', function (req, res, next) {
  res.json({
    status: true,
    datas: {
      email: 'user@user.com',
      nom: 'user user',
    }
  });
});

router.delete('/', function (req, res, next) {
  req.session.destroy();
  res.json({
    status: true
  });
});

module.exports = router;
