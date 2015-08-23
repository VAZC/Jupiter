var d3 = require('d3');
var turf = require('turf');
var stationModel = require('./model/station.js');
var fs = require('fs');

function Processtime() {
	// private
	var that = this;
	var startTime;
	// public
	this.start = start;
	this.end = end;

	function start(prefix) {
		startTime = (new Date()).getTime();
		console.log(prefix + ', 起始時間: ' + startTime);
	}

	function end(prefix) {
		var end = (new Date()).getTime();
		console.log(prefix + ', 結束時間: ' + end + ', 執行秒數: ' + (end - startTime) / 1000.0);
	}
}

function Stations(model) {
	// private function
	var model = model;
	var fetch = fetch;
	var addToList = addToList;
	var getStationsPoint = getStationsPoint;
	var intersectTaiwan = intersectTaiwan;
	var calcNeighborhoods = calcNeighborhoods;
	var isNeighborhoods = isNeighborhoods;
	var isFeature = isFeature;
	var isReady = isReady;
	var setReadyCallback = setReadyCallback;

	// private
	var that = this;
	var stations = [];
	var taiwan_geo = [];
	var processtime = new Processtime();
	var ready = false;
	var readyCallback = function() {};

	// public function
	this.all = function() {
		return JSON.parse(JSON.stringify(stations));
	}

	this.refresh = function() {
		var _that = that;
		ready = false;
		fetch(function() {
			_that.voronoi();
			calcNeighborhoods();
			ready = true;
			readyCallback.call(_that);
		});
	}

	this.voronoi = function() {
		processtime.start('voronoi');

		var _that = that;
		var vor = d3.geom.voronoi();
		var vor_polygons = vor(getStationsPoint());
		var filter_station = [];

		processtime.end('voronoi');
		processtime.start('voronoi intersect');

		vor_polygons.forEach(function(element, index) {
			var area_polygon = intersectTaiwan(element);
			var station = _that.findStationByPoint(element.point);
			station.setGeoArea(area_polygon);

			if (!isFeature(area_polygon))
				filter_station.push(station);
		});

		console.log('原站點數量：' + stations.length);
		stations = stations.filter(function(station) {
			var b = true;
			for (var i = 0; i < filter_station.length; i++) {
				if (station === filter_station[i]) {
					b = false;
					break;
				}
			}
			return b;
		});
		console.log('修改後站點數量：' + stations.length);
		processtime.end('voronoi intersect');
	}

	this.findStationByPoint = function(p) {
		for (var i = 0; i < stations.length; i++) {
			var point = stations[i].getPoint();
			if (point[0] == p[0] && point[1] == p[1])
				return stations[i];
		}
	}

	this.pointsToPolygon = function(p) {
		var tps = [];
		for (var i = 0; i < p.length; i++) {
			tps.push(turf.point(p[i]));
		}
		var fc = turf.featurecollection(tps);
		return turf.convex(fc);
	}

	function setReadyCallback(callback) {
		readyCallback = callback;
	}

	function isReady() {
		return ready;
	}

	function calcNeighborhoods() {
		processtime.start('clac Neighborhood');
		for (var i = 0; i < stations.length; i++) {
			var station = stations[i];

			for (var j = 0; j < stations.length; j++) {
				var neighbor = stations[j];
				if (i === j) continue;

				if (isNeighborhoods(station, neighbor)) {
					station.addNeighbor(neighbor);
				}
			}
			// console.log('檢測站：' + station.getName() + '有 ' + station.getNeighbor().length + ' 個鄰居。');
		}
		processtime.end('clac Neighborhood');
	}

	function isNeighborhoods(station, neighbor) {
		var s_area = station.getGeoArea();
		var n_area = neighbor.getGeoArea();

		if (!isFeature(s_area) || !isFeature(n_area))
			return false;

		var s_poly = s_area.geometry.coordinates[0];
		var n_poly = n_area.geometry.coordinates[0];

		var times = 0;
		for (var i = 0; i < s_poly.length; i++) {
			for (var j = 0; j < n_poly.length; j++) {
				if (s_poly[i][0] === n_poly[j][0] &&
					s_poly[i][1] === n_poly[j][1]) {
					if (++times >= 2) {
						return true;
					}
				}
			}
		}
		return false;
	}

	function isFeature(o) {
		return typeof(o) === 'object' && o.type === 'Feature';
	}

	function intersectTaiwan(p) {
		return turf.intersect(taiwan_geo, that.pointsToPolygon(p));
	}

	function getStationsPoint() {
		var ps = [];
		for (var i = 0; i < stations.length; i++) {
			ps.push(stations[i].getPoint());
		}
		return ps;
	}

	function addToList(data) {
		stations = [];
		for (var i = 0; i < data.length; i++) {
			stations.push(new Station(data[i]));
		}
	}

	function fetch(callback) {
		processtime.start('StationModel');
		model(function(data) {
			addToList(data);
			processtime.end('StationModel');

			if (typeof(callback) === 'function')
				callback(data);
		});
	}

	function loadTaiwanGeo(callback) {
		var filename = './public/taiwan.geo.json';
		processtime.start('Taiwan Geo');

		fs.readFile(filename, 'utf8', function(err, file) {
			processtime.end('Taiwan Geo');

			if (!err && typeof(callback) === 'function')
				callback(file);
		});
	}

	function init() {
		var _that = that;

		loadTaiwanGeo(function(data) {
			var boundfs = turf.featurecollection([
				turf.point([119.3135, 25.3]),
				turf.point([122.0180, 25.3]),
				turf.point([122.0180, 21.89]),
				turf.point([119.3135, 21.89])
			]);
			var bound = turf.convex(boundfs);

			// taiwan_geo = JSON.parse(data);
			taiwan_geo = bound;
			that.refresh();
		});
	}

	init();
}

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
	var point = [lon, lat];
	var geo_point = turf.point(point);
	var neighbor = [];
	var area_point = [];
	var area_polygon = [];

	// public
	this.getLat = function() {
		return lat;
	}
	this.getLon = function() {
		return lon;
	}
	this.getName = function() {
		return name;
	}
	this.getPoint = function() {
		return point;
	}
	this.getGeoPoint = function() {
		return geo_point;
	}
	this.getCity = function() {
		return city;
	}
	this.getBelong = function() {
		return belong;
	}
	this.getRain = function() {
		return JSON.parse(JSON.stringify(rain));
	}
	this.getNeighbor = function() {
		return JSON.parse(JSON.stringify(neighbor));
	}
	this.addNeighbor = function(n) {
		neighbor.push(n);
	}
	this.setNeighbor = function(n) {
		neighbor = n;
	}
	this.contains = function(p) {
		return turf.inside(p, area_polygon);
	}
	this.setArea = function(a) {
		area_point = a;
	}
	this.setGeoArea = function(a) {
		area_polygon = a;
	}
	this.getArea = function() {
		return area_point;
	}
	this.getGeoArea = function() {
		return area_polygon;
	}
}

var stations = new Stations(stationModel);
module.exports = stations;
