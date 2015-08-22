var map;
var myLocationMarker;
// var jupiter;
var defaultCenterLatLng = {
    lat: 25.047833423462535,
    lng: 121.51709318161011
};

function main() {
    console.log("centerLatLng");
    getLocation();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initMap, getLocationFail);
    } else {
        console.log("Geolocation is not support at this browser.");
    }
}

function getLocationFail(error) {
    console.log(error);
    initMap(null);
}

function initMap(position) {
    var centerLatLng;
    if (position) {
        centerLatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }
    } else {
        centerLatLng = defaultCenterLatLng;
    }

    map = new google.maps.Map(document.getElementById('map'), {
        center: centerLatLng,
        zoom: 13
    });

    myLocationMarker = new google.maps.Marker({
        position: centerLatLng,
        animation: google.maps.Animation.DROP,
        map: map
    });

    map.data.setStyle({
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#333333',
            fillOpacity: 0.8,
            strokeColor: '#666666',
            strokeOpacity: 0.5,
            scale: 8
        }
    });

    $.get('/json', function(result) {
        var oripoint = [];
        for (var i = 0; i < result.length; i++) {
            console.log(result[i]);
            var point = turf.point([result[i].lon, result[i].lat]);
            oripoint.push([result[i].lon, result[i].lat]);
            map.data.addGeoJson(point);
        };

        var voronoi = d3.geom.voronoi();
        var vor_polygons = voronoi(oripoint);

        vor_polygons.forEach(function(element, index) {
            map.data.addGeoJson(ArrayToConvex(element));
        });
    });
}

function ArrayToConvex(e) {
    var boundfs = turf.featurecollection([
        turf.point([119.3135, 25.3]),
        turf.point([122.0180, 25.3]),
        turf.point([122.0180, 21.89]),
        turf.point([119.3135, 21.89])
    ]);
    var bound = turf.convex(boundfs);

    var tps = [];
    for (var i = 0; i < e.length; i++) {
        var p = e[i];
        tps.push(turf.point(p));
    }
    var fc = turf.featurecollection(tps);
    var convex = turf.convex(fc);
    return turf.intersect(bound, convex);
}
