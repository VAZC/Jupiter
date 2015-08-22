'use strict'
var turf = require('turf'),
	extend = require('util')._extend;

var cellList = [
{	// object 1
	lat : 25,	// center lat
	lon : 120,	// center lon
	neighbors : [
		// object2 reference, 
		// object3 reference, 
		// object4 reference, 
		// object5 reference, 
		// object6 reference
	],
},
{	// object 2
	lat : 25.1,
	lon : 120,

	neighbors : [
		// object1 reference, 
		// object3 reference, 
		// object4 reference, 
		// object5 reference, 
		// object6 reference
	],
}];

var predict = {
	// get possible area
	possibleAreas : function(oldRainyAreas, newRainyAreas) {
		var possibleAreas = [];

		// extract different area
		newRainyAreas = this.filter(oldRainyAreas, newRainyAreas);
		// get possible areas
		oldRainyAreas.forEach(function(oldRainyArea) {
			newRainyAreas.forEach(function(newRainyArea) {
				// find neighbors
				oldRainyArea.neighbors.forEach(function(neighborArea) {
					if (this.isSameArea(neighborArea, newRainyArea)) {
						var areas = find(oldRainyArea, newRainyArea);
						possibleAreas.push.apply(possibleAreas, areas);
					}
				});
			});
		});
		return possibleAreas;
	},
	// find possible area
	find : function(oldRainyArea, newRainyArea) {
		var start = turf.point([oldRainyArea.lon, oldRainyArea.lat]),
			end = turf.point([newRainyArea.lon, newRainyArea.lat]),
			geoInfo = geoInfo(start, end),
			areas = [];
			// find possible area
			newRainyArea.neighbors.forEach(function(neighborArea) {
				if (this.isPossibleArea(newRainyArea, neighborArea, geoInfo)) {
					areas.psuh(neighborArea);
				}
			});
		return areas;
	},
	// return different area
	filter : function(oldRainyAreas, newRainyAreas) {
		return newRainyAreas.filter(function(newRainyArea) {
			var result = true;
			// filter different
			oldRainyAreas.forEach(function(oldRainyArea) {	
				result = !this.isSameArea(oldRainyArea, newRainyArea);
			});
			return result;
		});
	},
	// check same area
	isSameArea : function(area1, area2) {
		if (area1.lat === area2.lat && area1.lon === area2.lon) {
			return true;
		}
		return false;
	},
	// check possible area
	isPossibleArea : function(newRainyArea, neighborArea, geoInfo) {
		var start = turf.point([newRainyArea.lon, newRainyArea.lat]),
			end = turf.point([neighborArea.lon, neighborArea.lat]),
			neighborGeoInfo = geoInfo(start, end);
		if (geoInfo.bearing - neighborGeoInfo.bearing <= 20) {
			return true;
		}
		return false;
	},
	// get two location geo info
	geoInfo : function(start, end) {
		return {
			distance : turf.distance(start, end),
			bearing : turf.bearing(start, end)
		}
	}
};

module.exports = predict;
