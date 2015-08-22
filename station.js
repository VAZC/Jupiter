var d3 = require('d3');
var turf = require('turf');
var stationModel = require('./model/station.js');

var data = [[0,0], [100,100], [200,200]];
var voronoi = d3.geom.voronoi();
var polygons = voronoi(data);

console.log(turf.point([123, 456]))

stationModel(function(data) {
	console.log(data);
});

function Station(s) {
	// private
	var name = s.locationName;
	var lat = s.lat;
	var lon = s.lon;
	var city = s.city;
	var belong = s.attribute;
	var rain = {
		now: s.now_10,
		old: s.last_10
	}
	var point = [lat, lon];
	var geo_point = turf.point(point);
	var neibor = [];

	// public
	this.getName = function() { return name; }
	this.getPoint = function() { return point; }
	this.getGeoPoint = function() { return geo_point; }
	this.getCity = function() { return city; }
	this.getBelong = function() { return belong; }
	this.getRain = function() { return JSON.parse(JSON.stringify(rain)); }
	this.getNeibor = function() { return JSON.parse(JSON.stringify(neibor)); }
	this.setNeibor = function(n) { neibor = n; }
}