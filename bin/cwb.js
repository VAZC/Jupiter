var env = require('../env');
var fs = require('fs');
var request = require('request');
var parser = require('xml2json');
var moment = require('moment');
var CronJob = require('cron').CronJob;
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('../tenrain.sqlite');

var logTime = function(msg) {
    var time = moment().format('YYYYMMDD_hhmmss_SSS');
    console.log('[' + time + '] ' + msg);
    return time;
};
var getCwbLocations = function(xml) {
    env.rawJSON = JSON.parse(parser.toJson(xml));
    return env.rawJSON.cwbopendata.location;
};

var index2key = function(index_list) {
    var key_list = {};
    var key, value;
    index_list.forEach(function(element, index, array) {
        if (index_list[index].parameterName) {
            key = index_list[index].parameterName;
            value = index_list[index].parameterValue;
        };
        if (index_list[index].elementName) {
            key = index_list[index].elementName;
            value = index_list[index].elementValue.value;
        };
        key_list[key] = value;
    });
    return key_list;
};

var getEnvLocations = function(locations) {
    for (var i = 0; i < locations.length; i++) {
        locations[i].parameter = index2key(locations[i].parameter);
        locations[i].weatherElement = index2key(locations[i].weatherElement);
    };
    return locations;
};

var getCwbXML = function() {
    var start_time = logTime('start');
    request({
        url: env.url_tenrain+'&gy='+Math.random()
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var locations = getCwbLocations(body);
            env.locations = getEnvLocations(locations);
            db.serialize(function() {
                db.run("CREATE TABLE IF NOT EXISTS  station (stationId, locationName, lat, lon, city, city_sn, town, town_sn, attribute)");
                db.run("CREATE TABLE IF NOT EXISTS  measurement (stationId, min_10, hour_3, hour_6, hour_12, hour_24, now, rain, elev, time)");

                var select_station_query = db.prepare("select * from station where stationId=?");
                var insert_station_query = db.prepare("INSERT INTO station(stationId, locationName, lat, lon, city, city_sn, town, town_sn, attribute) VALUES( ? , ? , ? , ? , ? , ? , ? , ? , ? )");
                env.locations.forEach(function(element, index, array) {
                    select_station_query.get([element.stationId], function(err, row) {
                        if (arguments.length === 1 && (element.stationId !== undefined && element.stationId !== null)) {
                            insert_station_query.run(element.stationId, element.locationName, element.lat, element.lon, element.parameter.CITY, element.parameter.CITY_SN, element.parameter.TOWN, element.parameter.TOWN_SN, element.parameter.ATTRIBUTE);
                        };
                    });
                });

                var select_measurement_query = db.prepare("select * from measurement where stationId=? and time=?");
                var insert_measurement_query = db.prepare("INSERT INTO measurement(stationId, min_10, hour_3, hour_6, hour_12, hour_24, now, rain, elev, time) VALUES( ? , ? , ? , ? , ? , ? , ? , ? , ?, ? )");
                env.locations.forEach(function(element, index, array) {
                    select_measurement_query.get([element.stationId, element.time.obsTime], function(err, row) {
                        if (arguments.length === 1 && (element.stationId !== undefined && element.stationId !== null)) {
                            insert_measurement_query.run(element.stationId, element.weatherElement.MIN_10, element.weatherElement.HOUR_3, element.weatherElement.HOUR_6, element.weatherElement.HOUR_12, element.weatherElement.HOUR_24, element.weatherElement.NOW, element.weatherElement.ELEV, element.weatherElement.RAIN, element.time.obsTime);
                        };
                    });
                });

            });
            logTime('end');
        }
    });
};
new CronJob('1,11,21,31,41,51 * * * * *', function() {
    getCwbXML();
}, null, true, 'Asia/Taipei');
getCwbXML();
