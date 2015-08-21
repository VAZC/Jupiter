var env = require('../env');
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
    var options = {
        url: env.url_tenrain
    };
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var json = parser.toJson(body);
            res.send(json);
        }
    })
});

module.exports = router;
