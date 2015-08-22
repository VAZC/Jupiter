var env = require('../env');
var fs = require('fs');
var express = require('express');
var request = require('request');
var parser = require('xml2json');

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('./tenrain.sqlite');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

router.get('/json', function(req, res, next) {
    res.json(env.locations);
});

router.get('/station', function(req, res, next) {
    db.serialize(function() {
        var select_station_query = db.prepare("select * from station order by stationId desc");
        select_station_query.all([], function(err, rows) {
            res.json(rows);
        });
    });
});

router.get('/station/:id', function(req, res, next) {
    db.serialize(function() {
        var select_station_query = db.prepare("select * from station where stationId=?");
        var select_measurement_query = db.prepare("select * from measurement where stationId=?");
        var station = {};
        select_station_query.get([req.params.id], function(err, row) {
        	if (!row) {
        		res.send('Fuck you');
        		return;
        	};
            station = row;
            select_measurement_query.all([req.params.id], function(err, rows) {
                station.measurements = rows;
                res.json(station);
            });
        });
    });
});

router.get('/measurement', function(req, res, next) {
    db.serialize(function() {
        var select_measurement_query = db.prepare("select * from measurement order by stationId desc");
        select_measurement_query.all([], function(err, rows) {
            res.json(rows);
        });
    });
});

module.exports = router;
