var express = require('express');
var request = require('request');
// var cheerio = require('cheerio');
var parser = require('xml2json');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

router.get('/json', function(req, res, next) {
    var options = {
        url: 'http://opendata.cwb.gov.tw/member/opendataapi?dataid=O-A0002-001&authorizationkey=CWB-24564629-A5A6-409B-A91D-7996423BF593',
        headers: {
            'User-Agent': 'request'
        }
    };
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var json = parser.toJson(body);
            res.json(json);
        }
    })
});

module.exports = router;
