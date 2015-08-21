var env = require('../env');
var fs = require('fs');
var express = require('express');
var request = require('request');
var parser = require('xml2json');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

router.get('/json', function(req, res, next) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.send(env.json);
});

module.exports = router;
