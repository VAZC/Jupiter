var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('./tenrain.sqlite');

var StationModel = function(callback) {
    db.serialize(function() {
        var select_station_query = db.prepare("\
        	select\
        		station.*,\
        		(select min_10 from measurement where measurement.stationId=station.stationId order by measurement.time desc limit 1) as now_10,\
        		(select min_10 from measurement where measurement.stationId=station.stationId order by measurement.time desc limit 1 offset 1) as last_10\
        	from station");
        select_station_query.all([], function(err, rows) {
            callback(rows);
        });
    });
};

module.exports = StationModel;