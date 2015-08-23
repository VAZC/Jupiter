'use strict';
var turf = require('turf'),
	// find possible area
	find = function(oldRainyArea, newRainyArea) {
		var start = turf.point([oldRainyArea.getLon(), oldRainyArea.getLat()]),
			end = turf.point([newRainyArea.getLon(), newRainyArea.getLat()]),
			geoInfo = getGeoInfo(start, end),
			areas = [];
			// find possible area
			newRainyArea.getNeighbor().forEach(function(neighborArea) {
				if (isPossibleArea(newRainyArea, neighborArea, geoInfo)) {
					areas.psuh(neighborArea);
				}
			});
		return areas;
	},
	// return different area
	filter = function(oldRainyAreas, newRainyAreas) {
		return newRainyAreas.filter(function(newRainyArea) {
			var result = true;
			// filter different
			oldRainyAreas.forEach(function(oldRainyArea) {	
				result = !isSameArea(oldRainyArea, newRainyArea);
			});
			return result;
		});
	},
	// check same area
	isSameArea = function(area1, area2) {
		if (area1.getLat() === area2.getLat() && area1.getLon() === area2.getLon()) {
			return true;
		}
		return false;
	},
	// check possible area
	isPossibleArea = function(area, neighborArea, geoInfo) {
		var start = turf.point([area.getLon(), area.getLat()]),
			end = turf.point([neighborArea.getLon(), neighborArea.getLat()]),
			neighborGeoInfo = getGeoInfo(start, end),
			distanceUnit = 0.1,
			distance = distanceUnit,
			i = 1;
		// use increasing distance to find out passby area
		while (distance <= neighborGeoInfo.distance) {
			distance = i++ * distanceUnit;
			var point = turf.destination(start, distance, geoInfo.bearing, 'kilometers');
			if (neighborArea.contains(point)) {
				return true;
			}
		}
		return false;
	},
	// get two location geo info
	getGeoInfo = function(start, end) {
		return {
			distance : turf.distance(start, end),
			bearing : turf.bearing(start, end)
		};
	};

module.exports = {
	// get possible area
	possibleAreas : function(oldRainyAreas, newRainyAreas) {

		var possibleAreas = [];

		// extract different area
		newRainyAreas = filter(oldRainyAreas, newRainyAreas);
		console.log(oldRainyAreas.length, newRainyAreas.length);
		// get possible areas
		oldRainyAreas.forEach(function(oldRainyArea) {
			newRainyAreas.forEach(function(newRainyArea) {
				// find neighbors
				console.log(oldRainyArea.getNeighbor());
				oldRainyArea.getNeighbor().forEach(function(neighborArea) {
					console.log(neighborArea, newRainyArea);
					if (isSameArea(neighborArea, newRainyArea)) {
						var areas = find(oldRainyArea, newRainyArea);
						possibleAreas.push.apply(possibleAreas, areas);
					}
				});
			});
		});
		return possibleAreas;
	}
};
