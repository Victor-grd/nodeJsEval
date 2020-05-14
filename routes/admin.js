// req.session.user.username
var express = require('express');
var createError = require('http-errors');
var router = express.Router();
const Mongo = require('../bin/mongo') ;
const ObjectId = require('mongodb').ObjectId
const uniqueId = require('uniqid') ;
const multer = require('multer');
const fs = require('fs')

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, __dirname + "/../uploadedFiles");
  },
  filename: function (req, file, cb) {
    let ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
    let fileName = uniqueId('pdfFile-') + ext ;
    cb(null, fileName);
  }
});
const upload = multer({storage: storage});

/* admin avec formulaire login/creation */
router.get('/', function(req, res, next) {
  if(req.session && req.session.user)
    return next() ;
  res.render('admin/index', {title:"Room"});
});

router.use(function(req, res, next) {
  // si la session n'exite pas
  if(!req.session || !req.session.user)
    return next(createError(403));
  return next();
})

/* retourne le dashboard */
router.get('/', function(req, res, next) {
  Mongo.getInstance().collection('room').find().toArray((err, rooms)=> {
    // console.log(req.session.user);
    res.render('admin/dashboard', {title:"Administration des Room", rooms:rooms, user:req.session.user});
  })
});

/* creation d'une room */
router.post('/', function(req, res, next) {
  let errors = [] ;

  if(errors.length)
    return next(createError(412, "Merci de vérifier les champs : "+errors.join(', ')));
    console.log("############################################");
    console.log(req.body.status)
    console.log("############################################");
    

  let datas = {
    name: req.body.name,
    status: req.body.status,
    users : [req.session.user._id],
    owner_name :req.session.user.pseudo,
    owner_id :req.session.user._id,
  };

  Mongo.getInstance().collection('room').insertOne(datas, (err, result) => {
    if(err) {
      return next(createError(400));
    }
    res.redirect('/admin');
  })
});

/* detail d'une room */
router.get('/:id', function(req, res, next) {
  Mongo.getInstance().collection('room').findOne({_id:new ObjectId(req.params.id)}, (err, room) => {
    if(err)
      return res.json({status : false, message:err.message});
    res.json({status : !!room._id, datas:room});
  })

});

/* suppression d'une room */
router.delete('/:id', function(req, res, next) {

  Mongo.getInstance().collection('room').findOne({_id:new ObjectId(req.params.id)}, (err, room) => {
    if(err)
      return res.json({status : false, message:err.message});
    if(!room._id)
      return res.json({status : false, message:'room non trouvé'});

    Mongo.getInstance().collection('room').deleteOne({_id:new ObjectId(req.params.id)}, (err, result) => {
      res.json({status : result.deletedCount === 1});
    })
  })

});

module.exports = router;
