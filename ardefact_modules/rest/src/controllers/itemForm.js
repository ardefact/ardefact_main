'use strict';

var FS   = require('fs');
var Path = require('path');

var Hashids = require('hashids'),
    Q       = require('q'),
    _       = require('lodash'),
    Bcrypt  = require('bcrypt'),
    RestUtils              = require('./../RestUtils'),
    ExifImage      = require('exif').ExifImage,
    readChunk = require('read-chunk'),
    imageType = require('image-type');

var ArdefactUtils          = require('utils');
var ArdefactConfig         = require('config');
var ArdefactDatabaseBridge = require('db');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

var update_item_form = (req, res, next) => {
  const ItemFormModel = ArdefactDatabaseBridge.collections.ItemForm.getModel(ArdefactDatabaseBridge.getDb());

  let email = res.locals.user.email;

  let data = {
    name: req.body.name,
    location: req.body.location,
    cost: req.body.cost,
    rarity: req.body.rarity,
    isCluster: req.body.isCluster,
    submitter : email,
    last_touched_ms: + new Date()
  };

  ItemFormModel.findByEmail(email).then((result) => {
    if(result) {
      result = _.extend(result, data);
      result.save().then((result) => {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).end(JSON.stringify(result));
      }).catch((err) => {
        LOG.error(err);
        return res.status(500).send(err);
      });
    }
    else {
      var itemForm = new ItemFormModel(data);
      itemForm.save().then((result) => {
        LOG.info(result)
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).end(JSON.stringify(result));
      }).catch((err) => {
        LOG.error(err)
      });
    }
  }).catch((err) => {
    LOG.error(err);
    return res.status(500).send(err);
  });
};

var get_item_form = (req, res, next) => {
  const ItemFormModel = ArdefactDatabaseBridge.collections.ItemForm.getModel(ArdefactDatabaseBridge.getDb());
  var email = res.locals.user.email;
  ItemFormModel.findByEmail(email).then((result) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).end(JSON.stringify(result));
  });
};

var add_image = (req, res, next) => {
  var user = res.locals.user;
  let sampleFile = req.files.userImage;

  if(imageType(sampleFile.data) == null) {
    return res.status(400).send('not an image');
  }

  let fileName = user.email + +new Date();
  sampleFile.mv(RestUtils.getUploadPath() + fileName, function (err) {
    if (err) {
     LOG.error(err);
     return res.status(500).send(err);
    }

    try {
    new ExifImage({ image : RestUtils.getUploadPath() + fileName }, function (err, exifData) {
    if (err)
    LOG.error(err);
    else
    LOG.info(exifData); // Do something with your data!
    });
    } catch(error) {
    LOG.error(err);
    }

    let promise = null;

    var ItemFormModel = ArdefactDatabaseBridge.collections.ItemForm.getModel();

    ItemFormModel.findOne({'submitter': user.email}, function (err, result) {

      if (result) {
        if (Object.prototype.toString.call(result['pictures']) === '[object Array]') {
          result['pictures'].push({uris: {full: fileName}});
        }
        else {
          result['pictures'] = [{uris: {full: fileName}}];
        }
        promise = result.save();
      }
      else {
        let data = {
          submitter: user.email,
          last_touched_ms: +new Date(),
          pictures: [{uris: {full: fileName}}]
        };

        promise = ItemFormModel.create(data);
      }

      promise.then(function (product) {
        const index = product['pictures'].length - 1;
        const result = product['pictures'][index];
        res.setHeader('Content-Type', 'application/json');
        res.status(200).end(JSON.stringify(result));
      }).catch(err => LOG.error(err));
    });
  });
};

var remove_image = (req, res, next) => {

  var user = res.locals.user;
  if (!user) {
    res.status(403).end("Not authenticated");
  } else {

    var ItemFormModel = ArdefactDatabaseBridge.collections.ItemForm.getModel();

    ItemFormModel.findOne({ 'submitter': user.email }, function (err, result) {

      var filePath = RestUtils.getUploadPath();
      filePath += result['pictures'][req.params['image_index']]['uris']['full'];

      LOG.info(filePath);

      FS.unlink(filePath, ()=>{
        result['pictures'].splice(req.params.image_index, 1);
        result.save().then(
          result => {
            res.set('Content-Type', 'text/html');
            res.status(200).end();
          }
        );
      });

    }).catch(err => LOG.error(err));
  }

};

module.exports = {
  update_item_form  : update_item_form,
  get_item_form: get_item_form,
  add_image: add_image,
  remove_image: remove_image
};