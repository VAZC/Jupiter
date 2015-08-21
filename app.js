process.env.TZ = 'Asia/Taipei';
var env = require('./env');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var CronJob = require('cron').CronJob;
var request = require('request');
var parser = require('xml2json');
var fs = require('fs');
var moment = require('moment');
var getJSON = function() {
    var time = moment().format('YYYYMMDD_hhmmss_SSS');
    request({
        url: env.url_tenrain
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            env.rawJSON = JSON.parse(parser.toJson(body));
            var locations = env.rawJSON.cwbopendata.location;
            for (var i = 0; i < locations.length; i++) {
                var parameter = {};
                locations[i].parameter.forEach(function(element, index, array) {
                    var key = locations[i].parameter[index].parameterName;
                    var value = locations[i].parameter[index].parameterValue;
                    parameter[key] = value;
                });
                locations[i].parameter = parameter;
                var weatherElement = {};
                locations[i].weatherElement.forEach(function(element, index, array) {
                    var key = locations[i].weatherElement[index].elementName;
                    var value = locations[i].weatherElement[index].elementValue.value;
                    weatherElement[key] = value;
                });
                locations[i].weatherElement = weatherElement;
            };
            env.locations = locations;
            fs.writeFile('data/'+time+'.json', JSON.stringify(locations));
            console.log('Updated JSON in ' + time);
        }
    });
};

new CronJob('0 * * * * *', function() {
    getJSON();
}, null, true, 'Asia/Taipei');

getJSON();

module.exports = app;
