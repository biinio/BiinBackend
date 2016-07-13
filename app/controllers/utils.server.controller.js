var path = require("path"), uuid = require('node-uuid'),
    fs = require('fs'),
    util = require('util'),
    math = require('mathjs'),
    moment = require('moment');

//Constants
var dateFormat = 'YYYY-MM-DD HH:mm:ss';

//Validations Utils
//modelValidations: Validations for the model
//modelObject: Object request to validate
//parent: If the model to validate has a parent
exports.validate = function (modelValidations, modelObject, parent) {
    var errors = null;
    if (modelValidations) {
        if (parent)
            parent += ".";

        //Required Validations
        if (modelValidations.required) {
            for (var req_i = 0; req_i < modelValidations.required.length; req_i++) {
                modelObject.checkBody(parent + modelValidations.required[req_i], 'The {field} is required').notEmpty();
            }
        }
        //Length Validations
        if (modelValidations.len) {
            for (var len_i = 0; len_i < modelValidations.len.length; len_i++) {
                modelObject.assert(parent + modelValidations.len[len_i].field, modelValidations.len[len_i].min + ' to ' + modelValidations.len[len_i].max + " characters required").len(modelValidations.len[len_i].min, modelValidations.len[len_i].max);
            }
        }

        //Email Validation
        if (modelValidations.email) {
            for (var email_i = 0; email_i < modelValidations.email.length; email_i++) {
                modelObject.assert(parent + modelValidations.email[email_i], 'valid email required').isEmail();
            }
        }

        errors = modelObject.validationErrors();
    }
    return errors;
};

//Get a random UIID
exports.getGUID = function () {
    return uuid.v4();
};

exports.getDateNow = function () {
    return moment().format(dateFormat);
};


exports.getDate = function (pdate) {
    return moment(pdate).format(dateFormat);
};


/*
 * Return a unique identifier with the given `len`.
 *
 * utils.uid(10);
 * // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
exports.getUIDByLen = function (len) {
    var buf = [],
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

//Get the extension of a file
exports.getExtension = function (filename) {
    var ext = path.extname(filename || '').split('.');
    return ext[ext.length - 1];
};

//Return a new name for an image
exports.getImageName = function (filename, toPath) {
    var extension = this.getExtension(filename);
    var newName = this.getGUID() + "." + extension;
    newName = newName.replace("-", "");
    //Verify if the image all ready exists
    /*fs.exists(path.join(filename,filename),function(exists){
     if(!exists){
     return  newName;
     }else{
     //Call again to try get a new image name
     return this.getImageName(filename,toPath);
     }
     });*/
    return newName;
};

//Misselanious Properties
exports.get = {};

exports.get.majorIncrement = function () {
    return 1;
};

exports.get.minorIncrement = function () {
    return 1;
};

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Get Proximity of two points in radians
exports.getProximity = function (startLat, startLng, endLat, endLng) {
    var resultLat = startLat - endLat;
    var resultLong = startLng - endLng;

    return math.sqrt((resultLat * resultLat) + (resultLong * resultLong));
};
//Return a radious in meter to radians
exports.metersToRadians = function (radious) {
    return ((process.env.STANDARD_RADIOUS / 1000) * 360) / process.env.EARTH_CIRCUMFERENCE;
};
  
